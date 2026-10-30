import { IUser, IMspUser } from '@repo/types';
import { IApiMapper } from '../../../common/interfaces/mapper.interface';

export class UsersMspMapper implements IApiMapper<any, Partial<IMspUser>, IUser> {
  
  toApiPayload(dto: any): Partial<IMspUser> {
    // Implement if your app needs to send POST/PUT payloads back upstream
    return {};
  }

  /** Maps raw OData / MSP Manager response objects down to clean IUser models */
  toDomain(apiRaw: IMspUser): IUser {
    return {
      id: apiRaw.UserId,
      emailAddress: apiRaw.EmailAddress || '',
      firstName: apiRaw.FirstName || '',
      lastName: apiRaw.LastName || '',
      status: apiRaw.Status || 'Active',
      enabled: apiRaw.Enabled ?? true,
      lastLogin: apiRaw.LastLogin || null,
      phoneMobile: apiRaw.PhoneMobile || null,
      companyId: apiRaw.CompanyId,
    };
  }
}
