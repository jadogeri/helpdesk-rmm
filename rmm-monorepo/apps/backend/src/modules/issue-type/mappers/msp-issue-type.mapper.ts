import { IIssueType, IMspIssueType } from '@repo/types';
import { IApiMapper } from '../../../common/interfaces/mapper.interface';

export class MspIssueTypesMapper implements IApiMapper<any, Partial<IMspIssueType>, IIssueType> {
  toApiPayload(dto: any): Partial<IMspIssueType> {
    return {};
  }

  /** Maps raw OData / MSP Manager response objects down to clean IIssueType models */
  toDomain(apiRaw: IMspIssueType): IIssueType {
    return {
      id: apiRaw.IssueTypeId,
      name: apiRaw.Name || '',
      description: apiRaw.Description || null,
      rmReferenceId: apiRaw.RmReferenceId || null,
      companyId: apiRaw.CompanyId || null,
      parentIssueTypeId: apiRaw.ParentIssueTypeId || null,
    };
  }
}
