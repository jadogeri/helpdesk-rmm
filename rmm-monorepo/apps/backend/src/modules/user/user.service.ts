// user.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { UserEntity } from '@repo/database';
import { IMspUser } from '@repo/types';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersMapper } from './mappers/users.mapper';
import { UsersMspMapper } from './mappers/msp-users.mapper';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { CacheKeys } from '@repo/constants';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Injectable()
export class UserService implements IMspSyncer {
  private readonly logger = new Logger(UserService.name);
  private readonly mapper = new UsersMapper();
  private readonly mspMapper = new UsersMspMapper();

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: EntityRepository<UserEntity>,
    @Inject(HelpdeskClientService)
    private readonly helpdeskClient: HelpdeskClientService,
    private readonly cacheService: CacheService, // 🟢 Inject performance-wrapped cache
  ) {}

  async getUsers(): Promise<UserResponseDto[]> {
    const cacheKey = CacheKeys.users.all;

    const cachedUsers = await this.cacheService.get<UserResponseDto[]>(cacheKey);
    if (cachedUsers) return cachedUsers;

    const entities = await this.userRepository.findAll();
    const domainUsers = entities.map((entity) => this.mapper.toDomain(entity));

    await this.cacheService.set(cacheKey, domainUsers, 3600);
    return domainUsers;
  }

  async getUserByEmail(email: string): Promise<UserResponseDto | null> {
    const cleanEmail = email.trim().toLowerCase();
    const cacheKey = `users:email:${cleanEmail}`; // Custom specific string matching layout

    // Tier 1: Performance-logged Cache Check
    const cachedUser = await this.cacheService.get<UserResponseDto>(cacheKey);
    if (cachedUser) return cachedUser;

    // Tier 2: Check Database
    let entity = await this.userRepository.findOne({ emailAddress: cleanEmail });

    // Tier 3: Resync fallback if completely missing
    if (!entity) {
      this.logger.warn(`⚠️ User email [${cleanEmail}] not found in database. Forcing live sync fallback...`);
      await this.syncFromMsp();
      entity = await this.userRepository.findOne({ emailAddress: cleanEmail });
    }

    if (entity) {
      const domainUser = this.mapper.toDomain(entity);
      await this.cacheService.set(cacheKey, domainUser, 3600);
      return domainUser;
    }

    this.logger.error(`❌ Verification Final: User email [${cleanEmail}] does not exist in any downstream provider.`);
    return null;
  }

  async syncFromMsp(): Promise<void> {
    this.logger.log('🔄 Triggering full User cache synchronization from MSP Manager...');

    try {
      const response = await this.helpdeskClient.get<{ value: IMspUser[] }>('Users');
      if (!response?.value) {
        this.logger.warn('⚠️ Received empty or malformed user metadata payload batch from external API.');
        return;
      }

      const fork = this.userRepository.getEntityManager().fork();
      const payloadRecords = response.value.map((item) => {
        return UsersMapper.toDBPayload(this.mspMapper.toDomain(item));
      });

      await fork.upsertMany(UserEntity, payloadRecords as any[]);
      await fork.flush();

      // 🧼 Invalidate general lists post-ingestion to ensure consistency
      await this.cacheService.delete(CacheKeys.users.all);

      this.logger.log(`🎉 Ingestion complete! Successfully cached [${payloadRecords.length}] user application profiles.`);
    } catch (error) {
      this.logger.error('❌ Critical execution crash caught within the target Users data stream.', error);
      throw error;
    }
  }
}
