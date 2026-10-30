// location.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { LocationEntity, CustomerEntity } from '@repo/database';  
import { LocationResponseDto } from './dto/location-response.dto';
import { IMspLocation } from '@repo/types';
import { LocationsMapper } from './mappers/location.mapper';
import { MspLocationsMapper } from './mappers/msp-location.mapper';
import { CacheKeys } from '@repo/constants';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Injectable()
export class LocationService implements IMspSyncer {
  private readonly logger = new Logger(LocationService.name);
  private readonly mapper = new LocationsMapper();
  private readonly mspMapper = new MspLocationsMapper();

  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepo: EntityRepository<LocationEntity>,
    
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: EntityRepository<CustomerEntity>,

    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,

    // 🟢 Inject performance-wrapped Keyv Redis cache service
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Reads locations for a customer strictly out of Docker (Fast dropdowns)
   */
  async getLocationsByCustomer(customerId: string): Promise<LocationResponseDto[]> {
    // 💡 Fetch dynamic parameter-based string via typed schema layout contract
    const cacheKey = CacheKeys.locations.byCustomerId(customerId);

    // Tier 1: Check Redis container first
    const cachedCustomerLocations = await this.cacheService.get<LocationResponseDto[]>(cacheKey);
    if (cachedCustomerLocations) return cachedCustomerLocations;

    // Tier 2: Fetch from PostgreSQL database if Cache Miss
    const entities = await this.locationRepo.find({ customer: customerId });
    const domainCustomerLocations = entities.map((entity) => this.mapper.toDomain(entity));

    // Tier 3: Populate Redis cache store (TTL: 1 Hour = 3600 seconds)
    await this.cacheService.set(cacheKey, domainCustomerLocations, 3600);
    return domainCustomerLocations;
  }

  /**
   * Reads locations strictly out of Docker (Fast dropdowns)
   */
  async getLocations(): Promise<LocationResponseDto[]> {
    const cacheKey = CacheKeys.locations.all;

    // Tier 1: Check Redis container first
    const cachedLocations = await this.cacheService.get<LocationResponseDto[]>(cacheKey);
    if (cachedLocations) return cachedLocations;

    // Tier 2: Fetch from PostgreSQL database if Cache Miss
    const entities = await this.locationRepo.findAll();
    const domainLocations = entities.map((entity) => this.mapper.toDomain(entity));

    // Tier 3: Populate Redis cache store (TTL: 1 Hour = 3600 seconds)
    await this.cacheService.set(cacheKey, domainLocations, 3600);
    return domainLocations;
  }

  /**
   * The "God Sync" engine - Fetches live MSP data, parses relationships, and updates Docker
   */
  async syncAllLocationsFromMsp(): Promise<{ imported: number }> {
    this.logger.log('🔄 Triggering full Location cache synchronization from MSP Manager...');
    
    const response = await this.helpdeskClient.get<{ value: IMspLocation[] }>('Locations');
    
    if (!response?.value) {
      this.logger.warn('⚠️ Received empty or malformed location batch from external API.');
      return { imported: 0 };
    }

    const fork = this.locationRepo.getEntityManager().fork();

    const externalLocations = response.value
      .filter((item) => item.CustomerId && item.LocationId)
      .map((item) => this.mspMapper.toDomain(item));

    if (externalLocations.length === 0) {
      return { imported: 0 };
    }

    const uniqueCustomerIds = Array.from(new Set(externalLocations.map((loc) => loc.customerId)));
    
    const existingCustomers = await fork.find(CustomerEntity, { id: { $in: uniqueCustomerIds } });
    const existingCustomerIds = new Set(existingCustomers.map((c) => c.id));

    const stubbedCustomers = uniqueCustomerIds
      .filter((id) => !existingCustomerIds.has(id))
      .map((missingId) => ({
        id: missingId,
        name: `Pending Sync Customer (${missingId.slice(0, 8)})`,
        programLevelId: '00000000-0000-0000-0000-000000000000',
        customerStatusId: 1,
        company: null,
      }));

    if (stubbedCustomers.length > 0) {
      this.logger.warn(`⚠️ Found ${stubbedCustomers.length} missing parent customers during Location sync pass. Bulk stubbing placeholder records.`);
      await fork.upsertMany(CustomerEntity, stubbedCustomers);
      await fork.flush();
    }

    const locationPayloads = externalLocations.map((loc) => LocationsMapper.toDBPayload(loc));

    await fork.upsertMany(LocationEntity, locationPayloads as any[]);
    await fork.flush();

    // 🧼 PRODUCTION CRITICAL: Bulk invalidate cached layouts post-ingestion pass.
    // Because customer-specific keys (locations:customer:*) vary, we clear the main all list.
    // Pro-Tip: You can also use getAllKeys() to find and flush dynamic matching keys if needed.
    await this.cacheService.delete(CacheKeys.locations.all);

    this.logger.log(`🎉 God Sync Complete! Successfully unified [${externalLocations.length}] locations in Docker and cleared stale cache buffers.`);
    return { imported: externalLocations.length };
  }

  /**
   * Implements the IMspSyncer interface method to trigger full MSP sync for locations.
   */
  async syncFromMsp(): Promise<void> {
    await this.syncAllLocationsFromMsp();
  }
}
