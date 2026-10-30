import { ServiceItemEntity, CustomerEntity } from '@repo/database';
import { IServiceItem } from '@repo/types';
import { IMapper } from '../../../common/interfaces/mapper.interface';
import { ServiceItemResponseDto } from '../dto/service-item-response.dto';

export class ServiceItemsMapper implements IMapper<ServiceItemEntity, ServiceItemResponseDto> {
  
  toDomain(entity: ServiceItemEntity): ServiceItemResponseDto {
    const dto = new ServiceItemResponseDto();
    // 🟢 FIXED: Adjusted from legacy properties to clean lowercase parameters
    dto.id = entity.id;
    dto.name = entity.name;
    dto.typeCode = entity.typeCode;
    dto.customerId = entity.customerId; // Resolves structural entity getter cleanly
    return dto;
  }

  toEntity(domain: ServiceItemResponseDto): ServiceItemEntity {
    const entity = new ServiceItemEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.typeCode = domain.typeCode;
    
    // 🟢 FIXED: Map direct string ID to the relational field property instead of a read-only getter
    entity.customer = domain.customerId ? ({ id: domain.customerId } as CustomerEntity) : null;
    return entity;
  }

  /**
   * 🟢 STATIC HELPER: Safely compiles a clean Domain model object directly into a flat payload 
   * format that MikroORM bulk operations (like upsertMany) expect.
   */
  public static toDBPayload(item: IServiceItem) {
    return {
      id: item.id,
      name: item.name,
      typeCode: item.typeCode,
      customer: item.customerId || null, // Bridges domain string key to ORM relation container field
    };
  }
}
