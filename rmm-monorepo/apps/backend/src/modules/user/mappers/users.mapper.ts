import { UserEntity } from '@repo/database';
import { Reference } from '@mikro-orm/core'; // 🟢 Added if you want strict type wrapping, or plain object assignment
import { IMapper } from '../../../common/interfaces/mapper.interface';
import { UserResponseDto } from '../dto/user-response.dto';
import { IUser } from '@repo/types';

export class UsersMapper implements IMapper<UserEntity, UserResponseDto> {
  toDomain(entity: UserEntity): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = entity.id;
    dto.emailAddress = entity.emailAddress;
    dto.firstName = entity.firstName;
    dto.lastName = entity.lastName;
    dto.status = entity.status;
    dto.enabled = entity.enabled;
    dto.lastLogin = entity.lastLogin;
    dto.phoneMobile = entity.phoneMobile;
    dto.companyId = entity.companyId; // Pulls from your custom entity getter cleanly
    return dto;
  }

  toEntity(domain: UserResponseDto): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.emailAddress = domain.emailAddress;
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.status = domain.status;
    entity.enabled = domain.enabled;
    entity.lastLogin = domain.lastLogin;
    entity.phoneMobile = domain.phoneMobile;
    
    // 🟢 FIXED: Map the string ID to the entity's relation property.
    // MikroORM handles assigning primitive strings to relation references during persist/flush actions.
    entity.company = domain.companyId ? (domain.companyId as any) : null;
    
    return entity;
  }

    /**
   * Translates a clean Domain model object directly into a flat payload 
   * format that MikroORM bulk operations understand perfectly.
   */
  public static toDBPayload(user: IUser) {
    return {
      id: user.id,
      emailAddress: user.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      enabled: user.enabled,
      lastLogin: user.lastLogin,
      phoneMobile: user.phoneMobile,
      company: user.companyId || null, // Bridges the interface to the ORM relation key
    };
  }
}
