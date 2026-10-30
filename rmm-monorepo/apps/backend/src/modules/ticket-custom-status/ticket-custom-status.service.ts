// ticket-custom-status.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { IMspTicketCustomStatus } from '@repo/types';
import { TicketCustomStatusEntity } from '@repo/database';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { TicketCustomStatusMapper } from './mappers/ticket-custom-status.mapper';
import { MspTicketCustomStatusesMapper } from './mappers/msp-ticket-custom-status.mapper';
import { TicketCustomStatusResponseDto } from './dto/ticket-custom-status.dto';
import { CacheKeys } from '@repo/constants';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Injectable()
export class TicketCustomStatusService implements IMspSyncer {
  private readonly logger = new Logger(TicketCustomStatusService.name);
  private readonly mapper = new TicketCustomStatusMapper();
  private readonly mspMapper = new MspTicketCustomStatusesMapper();

  constructor(
    @InjectRepository(TicketCustomStatusEntity)
    private readonly statusRepository: EntityRepository<TicketCustomStatusEntity>,

    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,

    // 🟢 Inject performance-wrapped Keyv Redis cache service
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Reads flat list cache strictly out of Docker (Fast cascading dropdowns)
   */
  async getCustomStatuses(): Promise<TicketCustomStatusResponseDto[]> {
    const cacheKey = CacheKeys.ticketCustomStatuses.all;

    // Tier 1: Check Redis container first
    const cachedStatuses = await this.cacheService.get<TicketCustomStatusResponseDto[]>(cacheKey);
    if (cachedStatuses) return cachedStatuses;

    // Tier 2: Check Database if Cache Miss
    const entities = await this.statusRepository.findAll();
    const domainStatuses = entities.map((entity) => this.mapper.toDomain(entity));

    // Tier 3: Populate Redis cache (TTL: 1 Hour = 3600 seconds)
    await this.cacheService.set(cacheKey, domainStatuses, 3600);
    return domainStatuses;
  }

  /**
   * The "God Sync" engine - Fetches live MSP OData records, guards FKs, and updates Docker via batch payloads
   */
  async syncAllCustomStatusesFromMsp(): Promise<{ imported: number }> {
    this.logger.log('🔄 Triggering full Ticket Custom Status cache synchronization from MSP Manager...');

    try {
      const response = await this.helpdeskClient.get<{ value: IMspTicketCustomStatus[] }>('TicketCustomStatuses');
      
      if (!response?.value) {
        this.logger.warn('⚠️ Received empty or malformed custom status batch from external API.');
        return { imported: 0 };
      }

      const fork = this.statusRepository.getEntityManager().fork();

      const statusPayloads = response.value.map((item) => {
        const domainStatus = this.mspMapper.toDomain(item);
        return TicketCustomStatusMapper.toDBPayload(domainStatus);
      });

      if (statusPayloads.length > 0) {
        await fork.upsertMany(TicketCustomStatusEntity, statusPayloads as any[]);
        await fork.flush();
      }
      
      // 🧼 PRODUCTION CRITICAL: Invalidate the flat dropdown cache right after ingestion completes.
      // This forces the very next user dropdown select hit to fetch fresh synchronized options.
      await this.cacheService.delete(CacheKeys.ticketCustomStatuses.all);

      this.logger.log(`🎉 God Sync Complete! Successfully unified [${statusPayloads.length}] custom statuses in Docker and invalidated stale cache.`);
      return { imported: statusPayloads.length };
    } catch (error) {
      this.logger.error('❌ Failed processing flat Ticket Custom Status structures.', error);
      throw error;
    }
  }

  /**
   * Implements the IMspSyncer interface method execution contract hook.
   */
  async syncFromMsp(): Promise<void> {
    await this.syncAllCustomStatusesFromMsp();
  }
}
