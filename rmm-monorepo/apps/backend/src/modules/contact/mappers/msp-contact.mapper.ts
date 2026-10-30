import { IContact, IMspContact } from '@repo/types';
import { IApiMapper } from '../../../common/interfaces/mapper.interface';

export class MspContactsMapper implements IApiMapper<any, Partial<IMspContact>, IContact> {
  
  toApiPayload(dto: any): Partial<IMspContact> {
    return {};
  }

  /** Maps raw OData / MSP Manager response objects down to clean IContact models */
  toDomain(apiRaw: IMspContact): IContact {
    return {
      id: apiRaw.ContactId,
      firstName: apiRaw.FirstName || '',
      lastName: apiRaw.LastName || '',
      emailAddress: apiRaw.EmailAddress || '',
      phoneMobile: apiRaw.PhoneMobile || '',
      companyId: apiRaw.CompanyId || '',
      locationId: apiRaw.LocationId || '',
    };
  }
}
