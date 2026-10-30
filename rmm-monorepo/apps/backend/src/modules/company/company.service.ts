// company.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { CompanyEntity } from '@repo/database';
import { IMspCompany } from '@repo/types';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { CompanyMspMapperClass } from './mappers/company.mapper';
import { CacheKeys } from '@repo/constants';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Injectable()
export class CompanyService implements IMspSyncer {
  private readonly logger = new Logger(CompanyService.name);
  private readonly mspMapper = new CompanyMspMapperClass();

  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: EntityRepository<CompanyEntity>,

    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,

    // 🟢 Inject performance-wrapped Keyv Redis cache service
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Reads from your live OData endpoint and upserts your company settings mapping.
   */
  async syncFromMsp(): Promise<void> {
    this.logger.log('🔄 Syncing primary MSP Company configuration footprint...');

    try {
      const response = await this.helpdeskClient.get<IMspCompany>('Company');

      if (!response || !response.CompanyId) {
        this.logger.warn('⚠️ Received invalid or empty Singleton payload from Company API.');
        return;
      }

      const domainCompany = this.mspMapper.toDomain(response);
      if (!domainCompany) {
        this.logger.warn('⚠️ Failed to map incoming metadata record into the application domain.');
        return;
      }

      const fork = this.companyRepository.getEntityManager().fork();
      const dbPayload = CompanyMspMapperClass.toDBPayload(domainCompany);

      await fork.upsert(CompanyEntity, dbPayload);
      await fork.flush();

      // 🧼 PRODUCTION CRITICAL: Invalidate the singleton config key post-sync
      const cacheKey = (CacheKeys as any).company?.all || 'company:all';
      await this.cacheService.delete(cacheKey);

      this.logger.log(`✅ Company Config Synchronized successfully and cache cleared: ${domainCompany.name}`);
    } catch (error) {
      this.logger.error('❌ Critical failure within Company config cache loop.', error);
      throw error;
    }
  }

  /**
   * Safely returns company configuration utilizing a multi-tiered lookup cache strategy
   */
  async getCompanyConfig(): Promise<CompanyEntity | null> {
    const cacheKey = (CacheKeys as any).company?.all || 'company:all';

    // Tier 1: Check Redis container first
    const cachedConfig = await this.cacheService.get<CompanyEntity>(cacheKey);
    if (cachedConfig) return cachedConfig;

    // Tier 2: Fetch from PostgreSQL database if Cache Miss
    const entity = await this.companyRepository.findOne({});
    
    // Tier 3: Populate Redis cache store (TTL: 24 Hours = 86400 seconds)
    if (entity) {
      await this.cacheService.set(cacheKey, entity, 86400);
    }

    return entity;
  }
}
