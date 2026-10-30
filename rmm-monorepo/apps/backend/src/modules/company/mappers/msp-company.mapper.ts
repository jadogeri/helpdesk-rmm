import {  ICompany, IMspCompany } from '@repo/types';
import { IApiMapper } from '../../../common/interfaces/mapper.interface';

export class CompanyMspMapper implements IApiMapper<any, IMspCompany, ICompany | null> {
  
  // Singletons typically do not accept generic creation payloads, return raw contract directly
  toApiPayload(dto: any): IMspCompany {
    return dto;
  }

  /**
   * Transforms raw PascalCase Company Singleton metadata down to clean camelCase application objects
   */
  toDomain(mspRaw: IMspCompany): ICompany | null {
    if (!mspRaw) return null;
    
    return {
      id: mspRaw.CompanyId,
      name: mspRaw.CompanyName || 'Orleans Assessors Office',
      lastTicketNumber: mspRaw.LastTicketNumber || 0,
      businessType: mspRaw.BusinessType || 0,
    };
  }

  /**
   * Safe flat database payload layout engine for fast upserts.
   * Keeps raw property conversions safely constrained to your persistence definitions.
   */
  public static toDBPayload(company: ICompany) {
    return {
      id: company.id,                            // Maps cleanly to "CompanyId" via Entity Metadata
      name: company.name,                        // Maps cleanly to "CompanyName" via Entity Metadata
      lastTicketNumber: company.lastTicketNumber, // Maps cleanly to "LastTicketNumber" via Entity Metadata
      businessType: company.businessType,         // Maps cleanly to "BusinessType" via Entity Metadata
    };
  }
}
