// apps/backend/src/modules/companies/company.mapper.ts

import { IApiMapper } from '../../../common/interfaces/mapper.interface';
import { ICompany, IMspCompany } from '@repo/types';

export class CompanyMspMapperClass implements IApiMapper<any, IMspCompany, ICompany | null> {
  
  // Singletons typically do not accept generic creation payloads, return raw contract directly
  toApiPayload(dto: any): IMspCompany {
    return dto;
  }

  /**
   * 🟢 Transforms raw PascalCase Company Singleton metadata down to clean camelCase application objects
   */
  toDomain(mspRaw: IMspCompany): ICompany | null{
    if (!mspRaw) return null;
    
    return {
      id: mspRaw.CompanyId,
      name: mspRaw.CompanyName,
      lastTicketNumber: mspRaw.LastTicketNumber,
      businessType: mspRaw.BusinessType,
    };
  }

    /**
   * Safe flat database payload layout engine for fast batch upserts
   */
  public static toDBPayload(company: ICompany) {
    return {
      id: company.id,                            // Maps cleanly to "CompanyId"
      name: company.name,                        // Maps cleanly to "CompanyName"
      lastTicketNumber: company.lastTicketNumber, // Maps cleanly to "LastTicketNumber"
      businessType: company.businessType,         // Maps cleanly to "BusinessType"
    };
  }
}

export const CompanyMspMapper = new CompanyMspMapperClass();
