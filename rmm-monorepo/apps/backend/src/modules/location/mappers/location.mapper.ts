import { LocationEntity, CustomerEntity } from '@repo/database';
import { IMapper } from '../../../common/interfaces/mapper.interface';
import { LocationResponseDto } from '../dto/location-response.dto';
import { ILocation } from '@repo/types';

export class LocationsMapper implements IMapper<LocationEntity, LocationResponseDto> {
  toDomain(entity: LocationEntity): LocationResponseDto {
    const dto = new LocationResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.customerId = entity.customerId; // Resolves clean lowercase getter
    return dto;
  }

  toEntity(domain: LocationResponseDto): LocationEntity {
    const entity = new LocationEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    
    // Pass string pointers directly to the relational property containers
    entity.customer = domain.customerId ? ({ id: domain.customerId } as CustomerEntity) : (null as any);
    return entity;
  }

  /**
   * Translates a clean Domain model object directly into a flat payload 
   * format that MikroORM bulk operations (like upsertMany) understand perfectly.
   */
  public static toDBPayload(location: ILocation) {
    return {
      id: location.id,
      name: location.name,
      customer: location.customerId || null, // Bridges domain key to ORM mapping field container
    };
  }
}
