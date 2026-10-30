// contact.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { IMspContact } from '@repo/types';
import { ContactEntity, LocationEntity } from '@repo/database';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { ContactResponseDto } from './dto/contact-response.dto';
import { ContactsMapper } from './mappers/contact.mapper';
import { MspContactsMapper } from './mappers/msp-contact.mapper';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { raw } from '@mikro-orm/core';
import { CacheKeys } from '@repo/constants';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Injectable()
export class ContactService implements IMspSyncer {
  private readonly logger = new Logger(ContactService.name);
  private readonly mapper = new ContactsMapper();
  private readonly mspMapper = new MspContactsMapper();

  constructor(
    @InjectRepository(ContactEntity)
    private readonly contactRepository: EntityRepository<ContactEntity>,

    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,

    // 🟢 Inject performance-wrapped Keyv Redis cache service
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Reads all contacts utilizing a multi-tiered lookup cache strategy
   */
  async getContacts(): Promise<ContactResponseDto[]> {
    const cacheKey = CacheKeys.contacts.all;

    // Tier 1: Check Redis container first
    const cachedContacts = await this.cacheService.get<ContactResponseDto[]>(cacheKey);
    if (cachedContacts) return cachedContacts;

    // Tier 2: Fetch from PostgreSQL database if Cache Miss
    const entities = await this.contactRepository.findAll();
    const domainContacts = entities.map((entity) => this.mapper.toDomain(entity));

    // Tier 3: Populate Redis cache store (TTL: 1 Hour = 3600 seconds)
    await this.cacheService.set(cacheKey, domainContacts, 3600);
    return domainContacts;
  }

  /**
   * High-Performance Single Contact Identity Resolution Strategy
   * Cache ➔ Database ➔ Live API Sync Fallback ➔ Final Validation Pass
   */
  async getContactByEmail(email: string): Promise<ContactResponseDto | null> {
    const cleanEmail = email.trim().toLowerCase();
    // 💡 Fetch dynamic parameter-based string via typed schema layout contract
    const cacheKey = CacheKeys.contacts.byEmail(cleanEmail);

    // Tier 1: Check Redis cache
    const cachedContact = await this.cacheService.get<ContactResponseDto>(cacheKey);
    if (cachedContact) return cachedContact;

    this.logger.log(`🔍 Cache Miss. Checking local storage for email: ${cleanEmail}`);

    // Tier 2: Check local database
    let entity = await this.contactRepository.findOne({
      [raw('LOWER(TRIM("EmailAddress"))')]: cleanEmail
    });

    // Tier 3: If completely missing locally, force an on-demand API resync fallback pass
    if (!entity) {
      this.logger.warn(`⚠️ Contact identity [${cleanEmail}] missing from local DB. Forcing live sync fallback...`);
      await this.syncFromMsp();

      // Re-query local repository storage after batch flush cycle completes
      entity = await this.contactRepository.findOne({
        [raw('LOWER(TRIM("EmailAddress"))')]: cleanEmail
      });
    }

    // Tier 4: Evaluate results and build cache entry backfill
    if (entity) {
      const domainContact = this.mapper.toDomain(entity);
      // Save back to cache to safeguard future lookup passes
      await this.cacheService.set(cacheKey, domainContact, 3600);
      return domainContact;
    }

    this.logger.error(`❌ Final Verification: Contact email [${cleanEmail}] does not exist in any provider database.`);
    return null;
  }

  /**
   * High-Performance Synchronization Engine utilizing batch operations and validation guards
   */
  async syncFromMsp(): Promise<void> {
    this.logger.log('🔄 Triggering full Contact cache synchronization from MSP Manager...');
    
    try {
      const response = await this.helpdeskClient.get<{ value: IMspContact[] }>('Contacts');
      if (!response?.value) {
        this.logger.warn('⚠️ Received empty or malformed contact data from external endpoint.');
        return;
      }

      const fork = this.contactRepository.getEntityManager().fork();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const uniqueLocationIds = new Set<string>();

      // 🟢 STEP 1: Parse API structures via decoupled integration mapper
      const externalContacts = response.value.map((item) => {
        const domainContact = this.mspMapper.toDomain(item);
        
        if (!domainContact.companyId || !uuidRegex.test(domainContact.companyId)) {
          domainContact.companyId = '';
        }
        
        if (domainContact.locationId && uuidRegex.test(domainContact.locationId)) {
          uniqueLocationIds.add(domainContact.locationId);
        } else {
          domainContact.locationId = '';
        }

        return domainContact;
      });

      // 🟢 STEP 2: Fast Relational Guarding Pass (Pre-stub missing Parent relations in bulk)
      if (uniqueLocationIds.size > 0) {
        const locationIds = Array.from(uniqueLocationIds);
        const existingLocations = await fork.find(LocationEntity, { id: { $in: locationIds } });
        const existingLocationIds = new Set(existingLocations.map((l) => l.id));

        const stubbedLocations = locationIds
          .filter((id) => !existingLocationIds.has(id))
          .map((missingId) => ({
            id: missingId,
            name: `Stubbed Location Parent (${missingId.slice(0, 8)})`,
            customer: null as any, 
          }));

        if (stubbedLocations.length > 0) {
          this.logger.warn(`⚠️ Found ${stubbedLocations.length} missing parent locations. Stubbing placeholders in bulk...`);
          await fork.upsertMany(LocationEntity, stubbedLocations);
          await fork.flush();
        }
      }

      // 🟢 STEP 3: High-Speed Batch Ingestion
      const contactPayloads = externalContacts.map((contact) => ContactsMapper.toDBPayload(contact));

      if (contactPayloads.length > 0) {
        await fork.upsertMany(ContactEntity, contactPayloads as any[]);
        await fork.flush();
      }

      // 🧼 PRODUCTION CRITICAL: Invalidate the base lists post-ingestion to guarantee data consistency
      await this.cacheService.delete(CacheKeys.contacts.all);

      this.logger.log(`🎉 Ingestion complete! Successfully cached [${externalContacts.length}] contacts and invalidated old caches.`);
    } catch (error) {
      this.logger.error('❌ Critical crash caught within the target Contacts processing lifecycle block.', error);
      throw error;
    }
  }
}
