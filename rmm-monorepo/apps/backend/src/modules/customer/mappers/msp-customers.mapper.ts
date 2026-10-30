import { ICustomer, IMspCustomer } from '@repo/types';
import { IApiMapper } from '../../../common/interfaces/mapper.interface';

export class MspCustomersMapper implements IApiMapper<any, Partial<IMspCustomer>, ICustomer> {
  
  toApiPayload(dto: any): Partial<IMspCustomer> {
    return {};
  }

  /** Maps raw OData / MSP Manager response objects down to clean ICustomer models */
  toDomain(apiRaw: IMspCustomer): ICustomer {
    return {
      id: apiRaw.CustomerId,
      name: apiRaw.CustomerName || '',
      referenceId: apiRaw.ReferenceId || null,
      programLevelId: apiRaw.ProgramLevelId || '',
      customerStatusId: apiRaw.CustomerStatusId || 0,
      companyId: apiRaw.CompanyId || null,
    };
  }
}
