// service-item.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ServiceItemEntity } from '@repo/database';
import { IMspServiceItem } from '@repo/types';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { ServiceItemResponseDto } from './dto/service-item-response.dto';
import { MspServiceItemsMapper } from './mappers/msp-service-item.mapper';
import { ServiceItemsMapper } from './mappers/service-item.mapper';
import { CacheKeys } from '@repo/constants';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Injectable()
export class ServiceItemService implements IMspSyncer {
  private readonly logger = new Logger(ServiceItemService.name);
  private readonly mapper = new ServiceItemsMapper();
  private readonly mspMapper = new MspServiceItemsMapper();

  constructor(
    @InjectRepository(ServiceItemEntity)
    private readonly serviceItemRepository: EntityRepository<ServiceItemEntity>,

    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,

    // 🟢 Inject performance-wrapped Keyv Redis cache service
    private readonly cacheService: CacheService,
  ) {}

  async getServiceItems(): Promise<ServiceItemResponseDto[]> {
    const cacheKey = CacheKeys.serviceItems.all;

    // Tier 1: Check Redis container layer first
    const cachedItems = await this.cacheService.get<ServiceItemResponseDto[]>(cacheKey);
    if (cachedItems) return cachedItems;

    // Tier 2: Fetch from PostgreSQL database if Cache Miss
    const entities = await this.serviceItemRepository.findAll();
    const domainItems = entities.map((entity) => this.mapper.toDomain(entity));

    // Tier 3: Populate Redis cache store (TTL: 1 Hour = 3600 seconds)
    await this.cacheService.set(cacheKey, domainItems, 3600);
    return domainItems;
  }

  /**
   * High-Performance Synchronization Engine utilizing batch operations
   */
  async syncAllServiceItemsFromMsp(): Promise<{ imported: number }> {
    this.logger.log('🔄 Triggering full Service Items cache synchronization from MSP Manager...');

    try {
      const response = await this.helpdeskClient.get<{ value: IMspServiceItem[] }>('ServiceItems');
      
      if (!response?.value) {
        this.logger.warn('⚠️ Received empty or malformed Service Items batch from external API.');
        return { imported: 0 };
      }

      const fork = this.serviceItemRepository.getEntityManager().fork();

      const serviceItemPayloads = response.value.map((item) => {
        const domainItem = this.mspMapper.toDomain(item);
        return ServiceItemsMapper.toDBPayload(domainItem);
      });

      if (serviceItemPayloads.length > 0) {
        await fork.upsertMany(ServiceItemEntity, serviceItemPayloads as any[]);
        await fork.flush();
      }

      // 🧼 PRODUCTION CRITICAL: Invalidate collection lists post-ingestion to enforce data symmetry
      await this.cacheService.delete(CacheKeys.serviceItems.all);

      this.logger.log(`🎉 Sync Complete! Successfully unified [${serviceItemPayloads.length}] service items in Docker and cleared stale cache buffers.`);
      return { imported: serviceItemPayloads.length };
    } catch (error) {
      this.logger.error('❌ Failed processing flat Service Item structures.', error);
      throw error;
    }
  }

  async syncFromMsp(): Promise<void> {
    await this.syncAllServiceItemsFromMsp();
  }
}
