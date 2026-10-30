// issue-type.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { IMspIssueType } from '@repo/types';
import { IssueTypeEntity } from '@repo/database'; 
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { IssueTypeResponseDto } from './dto/issue-types-response.dto';
import { IssueTypesMapper } from './mappers/issue-type.mapper';
import { MspIssueTypesMapper } from './mappers/msp-issue-type.mapper';
import { CacheKeys } from '@repo/constants';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Injectable()
export class IssueTypeService implements IMspSyncer {
  private readonly logger = new Logger(IssueTypeService.name);
  private readonly mapper = new IssueTypesMapper();
  private readonly mspMapper = new MspIssueTypesMapper();

  constructor(
    @InjectRepository(IssueTypeEntity) 
    private readonly issueTypeRepository: EntityRepository<IssueTypeEntity>,

    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,

    // 🟢 Inject performance-wrapped Keyv Redis cache service
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Reads tree hierarchy cache strictly out of Docker (Fast cascading dropdowns)
   */
  async getIssueTypes(): Promise<IssueTypeResponseDto[]> {
    const cacheKey = CacheKeys.issueTypes.all;

    // Tier 1: Check Redis container layer first
    const cachedTree = await this.cacheService.get<IssueTypeResponseDto[]>(cacheKey);
    if (cachedTree) return cachedTree;

    // Tier 2: Fetch and populate the recursive tree from PostgreSQL if Cache Miss
    const rootEntities = await this.issueTypeRepository.find(
      { parent: null },
      { populate: ['children'] }
    );

    const domainTree = rootEntities.map((entity) => this.mapper.toDomain(entity));

    // Tier 3: Populate Redis cache store (TTL: 1 Hour = 3600 seconds)
    await this.cacheService.set(cacheKey, domainTree, 3600);
    return domainTree;
  }

  /**
   * The Ingestion Engine - Fetches live data from the Helpdesk OData Client, 
   * normalizes fields, and executes safe two-phase dependency upserts.
   */
  async syncAllIssueTypesFromMsp(): Promise<{ imported: number }> {
    this.logger.log('🔄 Triggering full IssueType tree synchronization from MSP Manager...');

    try {
      const response = await this.helpdeskClient.get<{ value: IMspIssueType[] }>('IssueTypes');
      
      if (!response?.value) {
        this.logger.warn('⚠️ Received empty or malformed location batch from external API.');
        return { imported: 0 };
      }

      const fork = this.issueTypeRepository.getEntityManager().fork();
      
      const externalIssues = response.value.map((item) => this.mspMapper.toDomain(item));

      // 🛠️ PHASE 1: Parse and commit top-level parent headers first
      const parents = externalIssues.filter((item) => !item.parentIssueTypeId);
      const parentPayloads = parents.map((parent) => IssueTypesMapper.toDBPayload(parent));

      if (parentPayloads.length > 0) {
        await fork.upsertMany(IssueTypeEntity, parentPayloads, { onConflictFields: ['id'] });
        await fork.flush();
      }

      // 🛠️ PHASE 2: Ingest sub-category children dynamically checking dependencies
      const children = externalIssues.filter((item) => item.parentIssueTypeId);
      const childPayloads: any[] = [];

      for (const child of children) {
        let parentRecord = await fork.findOne(IssueTypeEntity, { id: child.parentIssueTypeId! });

        if (!parentRecord) {
          parentRecord = fork.create(IssueTypeEntity, {
            id: child.parentIssueTypeId!,
            name: `Stubbed Parent Category (${child.parentIssueTypeId!.slice(0, 8)})`,
            parent: null,
          } as any);
          fork.persist(parentRecord);
        }

        childPayloads.push(IssueTypesMapper.toDBPayload(child));
      }

      if (childPayloads.length > 0) {
        await fork.upsertMany(IssueTypeEntity, childPayloads, { onConflictFields: ['id'] });
        await fork.flush();
      }

      // 🧼 PRODUCTION CRITICAL: Wipe out stale structural trees after changes hit the DB
      await this.cacheService.delete(CacheKeys.issueTypes.all);

      this.logger.log(`🎉 God Sync Complete! Successfully unified [${externalIssues.length}] issue types in Docker and purged old structure caches.`);
      return { imported: externalIssues.length };
    } catch (error) {
      this.logger.error('❌ Failed processing recursive Issue Type tree structures.', error);
      throw error;
    }
  }

  /**
   * Implements the IMspSyncer interface method requirement
   */
  async syncFromMsp(): Promise<void> {
    await this.syncAllIssueTypesFromMsp();
  }
}
