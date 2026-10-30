import { ITicketCustomStatus, IMspTicketCustomStatus } from '@repo/types';
import { IApiMapper } from '../../../common/interfaces/mapper.interface';

export class MspTicketCustomStatusesMapper implements IApiMapper<any, Partial<IMspTicketCustomStatus>, ITicketCustomStatus> {
  
  toApiPayload(dto: any): Partial<IMspTicketCustomStatus> {
    return {};
  }

  /** Maps raw OData / MSP Manager response objects down to clean ITicketCustomStatus models */
  toDomain(apiRaw: IMspTicketCustomStatus): ITicketCustomStatus {
    return {
      id: apiRaw.TicketCustomStatusId,
      name: apiRaw.Name || '',
      description: apiRaw.Description || '',
      isDefault: apiRaw.IsDefault ?? false,
      ticketStatusCode: apiRaw.TicketStatusCode || 0,
      companyId: apiRaw.CompanyId || '',
    };
  }
}
