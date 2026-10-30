import { CompanyEntity, CustomerEntity } from "@repo/database";
import { IMapper } from "../../../common/interfaces/mapper.interface";
import { CustomerResponseDto } from "../dto/customer-response.dto";
import { ICustomer } from "@repo/types";

export class CustomersMapper implements IMapper<CustomerEntity, CustomerResponseDto> {
  
  /**
   * Transforms your strict database entity structure smoothly into a 
   * response wrapper layer for the client UI layer matching the implemented interface.
   */
  toDomain(entity: CustomerEntity): CustomerResponseDto {
    const dto = new CustomerResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.referenceId = entity.referenceId;
    dto.programLevelId = entity.programLevelId;
    dto.customerStatusId = entity.customerStatusId;
    dto.companyId = entity.companyId ?? null; 
    return dto;
  }

  /**
   * Re-maps incoming domain payload values into atomic MikroORM database entity models.
   * Satisfies the IMapper contract using standard type literal references.
   */
  toEntity(domain: CustomerResponseDto): CustomerEntity {
    const entity = new CustomerEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.referenceId = domain.referenceId;
    entity.programLevelId = domain.programLevelId;
    entity.customerStatusId = domain.customerStatusId;
    
    // Satisfies TypeScript by casting a standard identifier object reference placeholder
    entity.company = domain.companyId 
      ? ({ id: domain.companyId } as CompanyEntity)
      : null;

    return entity;
  }

  /**
   * Translates a clean Domain model object directly into a flat payload 
   * format that MikroORM bulk operations (like upsertMany) understand perfectly.
   */
  public static toDBPayload(customer: ICustomer) {
    return {
      id: customer.id,
      name: customer.name,
      referenceId: customer.referenceId,
      programLevelId: customer.programLevelId,
      customerStatusId: customer.customerStatusId,
      company: customer.companyId || null, // Bridges domain key to ORM mapping field container
    };
  }
}
