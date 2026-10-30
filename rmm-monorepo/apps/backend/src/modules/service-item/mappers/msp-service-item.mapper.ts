import { IServiceItem, IMspServiceItem } from '@repo/types';
import { IApiMapper } from '../../../common/interfaces/mapper.interface';

export class MspServiceItemsMapper implements IApiMapper<any, Partial<IMspServiceItem>, IServiceItem> {
  
  toApiPayload(dto: any): Partial<IMspServiceItem> {
    return {};
  }

  /** Maps raw OData / MSP Manager response objects down to clean IServiceItem models */
  toDomain(apiRaw: IMspServiceItem): IServiceItem {
    return {
      id: apiRaw.ServiceItemId,
      name: apiRaw.ServiceItemName || '',
      typeCode: apiRaw.ServiceItemTypeCode || 0,
      customerId: apiRaw.CustomerId || '',
    };
  }
}
