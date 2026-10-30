import { TicketCustomStatusEntity, CompanyEntity } from '@repo/database';
import { IMapper } from '../../../common/interfaces/mapper.interface';
import { TicketCustomStatusResponseDto } from '../dto/ticket-custom-status.dto';
import { ITicketCustomStatus } from '@repo/types';

export class TicketCustomStatusMapper implements IMapper<TicketCustomStatusEntity, TicketCustomStatusResponseDto> {
  
  /**
   * Transforms a database entity row into a flat domain status DTO block.
   */
  toDomain(entity: TicketCustomStatusEntity): TicketCustomStatusResponseDto {
    const dto = new TicketCustomStatusResponseDto();
    
    // 🟢 FIXED: Swapped out legacy PascalCase keys for clean lowercase keys matching your DTO class definition properties
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description ?? '';
    dto.isDefault = entity.isDefault;
    dto.ticketStatusCode = entity.ticketStatusCode;
    dto.companyId = entity.companyId;

    return dto;
  }

  /**
   * Re-maps incoming domain payload values into database entity models.
   */
  toEntity(domain: TicketCustomStatusResponseDto): TicketCustomStatusEntity {
    const entity = new TicketCustomStatusEntity(); 
    
    // 🟢 FIXED: Swapped out legacy PascalCase extraction paths to parse lowercase properties from your incoming domain object 
    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description || '';
    entity.isDefault = domain.isDefault;
    entity.ticketStatusCode = domain.ticketStatusCode;
    
    // Map direct string ID to the relational field property instead of a read-only getter
    entity.company = domain.companyId ? ({ id: domain.companyId } as CompanyEntity) : null;

    return entity;
  }

  /**
   * Safely compiles a clean Domain model object directly into a flat payload 
   * format that MikroORM bulk operations (like upsertMany) expect.
   */
  public static toDBPayload(status: ITicketCustomStatus) {
    return {
      id: status.id,
      name: status.name,
      description: status.description,
      isDefault: status.isDefault,
      ticketStatusCode: status.ticketStatusCode,
      company: status.companyId || null, // Bridges domain string key to ORM relation container field
    };
  }
}
