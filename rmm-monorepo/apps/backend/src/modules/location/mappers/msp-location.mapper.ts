import { ILocation, IMspLocation } from '@repo/types';
import { IApiMapper } from '../../../common/interfaces/mapper.interface';

export class MspLocationsMapper implements IApiMapper<any, Partial<IMspLocation>, ILocation> {
  toApiPayload(dto: any): Partial<IMspLocation> {
    return {};
  }

  /** Maps raw OData / MSP Manager response objects down to clean ILocation models */
  toDomain(apiRaw: IMspLocation): ILocation {
    return {
      id: apiRaw.LocationId,
      name: apiRaw.LocationName || '',
      customerId: apiRaw.CustomerId || '',
    };
  }
}
