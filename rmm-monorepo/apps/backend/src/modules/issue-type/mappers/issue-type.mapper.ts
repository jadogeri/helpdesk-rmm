// src/modules/issue-types/mappers/issue-type.mapper.ts
import { IssueTypeEntity } from '@repo/database';
import { IMapper } from '../../../common/interfaces/mapper.interface';
import { IssueTypeResponseDto } from '../dto/issue-types-response.dto';

export class IssueTypesMapper implements IMapper<IssueTypeEntity, IssueTypeResponseDto> {
  toDomain(entity: IssueTypeEntity): IssueTypeResponseDto {
    const dto = new IssueTypeResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.rmReferenceId = entity.rmReferenceId;
    dto.companyId = entity.companyId;
    dto.parentIssueTypeId = entity.parent?.id ?? null;
    
    // 🌲 FIX: Map the children collection recursively into the DTO!
    if (entity.children && entity.children.isInitialized()) {
      dto.children = entity.children
        .getItems()
        .map((child) => this.toDomain(child)); 
    } else {
      dto.children = [];
    }

    return dto;
  }

  toEntity(domain: IssueTypeResponseDto): IssueTypeEntity {
    const entity = new IssueTypeEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.rmReferenceId = domain.rmReferenceId;
    
    entity.company = domain.companyId ? (domain.companyId as any) : null;
    entity.parent = domain.parentIssueTypeId ? (domain.parentIssueTypeId as any) : null;
    return entity;
  }

  /**
   * Translates a clean Domain model object directly into a flat payload 
   * format that MikroORM bulk/upsert operations interpret accurately.
   */
  public static toDBPayload(issue: any): any {
    return {
      IssueTypeId: issue.id,
      Name: issue.name,
      Description: issue.description,
      RmReferenceId: issue.rmReferenceId,
      CompanyId: issue.companyId,
      ParentIssueTypeId: issue.parentIssueTypeId,
    };
  }
}
