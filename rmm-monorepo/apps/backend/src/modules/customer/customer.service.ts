// customer.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { IMspCustomer } from '@repo/types';
import { CustomerEntity } from '@repo/database'; 
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { CustomersMapper } from './mappers/customers.mapper';
import { MspCustomersMapper } from './mappers/msp-customers.mapper';
import { CacheKeys } from '@repo/constants';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Injectable()
export class CustomerService implements IMspSyncer {
  private readonly logger = new Logger(CustomerService.name);
  private readonly mapper = new CustomersMapper(); 
  private readonly mspMapper = new MspCustomersMapper();

  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: EntityRepository<CustomerEntity>,

    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,

    // 🟢 Inject performance-wrapped Keyv Redis cache service
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Safely returns a cleanly transformed domain model array to your controller endpoints
   */
  async findAll(): Promise<CustomerResponseDto[]> {
    const cacheKey = CacheKeys.customers.all;

    // Tier 1: Check Redis container first
    const cachedCustomers = await this.cacheService.get<CustomerResponseDto[]>(cacheKey);
    if (cachedCustomers) return cachedCustomers;

    // Tier 2: Fetch from PostgreSQL database if Cache Miss
    const entities = await this.customerRepository.findAll();
    const domainCustomers = entities.map((entity) => this.mapper.toDomain(entity));

    // Tier 3: Populate Redis cache store (TTL: 1 Hour = 3600 seconds)
    await this.cacheService.set(cacheKey, domainCustomers, 3600);
    return domainCustomers;
  }

  /**
   * Universal execution pass pulling external records and updating local storage safely.
   */
  async syncFromMsp(): Promise<void> {
    this.logger.log('🔄 Triggering full Customer cache synchronization from MSP Manager...');
    
    try {
      const response = await this.helpdeskClient.get<{ value: IMspCustomer[] }>('Customers');
      
      if (!response?.value) {
        this.logger.warn('⚠️ Helpdesk OData engine returned an empty or completely malformed customer array payload.');
        return;
      }

      this.logger.log(`📥 Received ${response.value.length} customer records from MSP Manager API.`);

      if (response.value.length === 0) {
        this.logger.warn('⚠️ No customer records retrieved. Skipping database transaction.');
        return;
      }

      const fork = this.customerRepository.getEntityManager().fork();

      const sanitizedRecords = response.value.map((item) => {
        const domainCustomer = this.mspMapper.toDomain(item);
        return CustomersMapper.toDBPayload(domainCustomer);
      });

      await fork.upsertMany(CustomerEntity, sanitizedRecords as any[]);
      await fork.flush();

      // 🧼 PRODUCTION CRITICAL: Clear the stale collection cache buffer right after data updates hit the DB
      await this.cacheService.delete(CacheKeys.customers.all);

      this.logger.log('✅ Customer database persistence layer synchronized successfully and stale cache cleared.');
    } catch (error) {
      this.logger.error('❌ Critical failure occurred within Customer synchronization execution loop.', error);
      throw error;
    }
  }
}
