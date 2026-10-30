// packages/types/src/companies/company.ts

/**
 * Clean Application Domain model for a tenant Company.
 * Separated from upstream raw OData layout schemas.
 */
export interface ICompany {
  /**
   * The unique identifier (UUID) assigned to the company.
   * Maps directly from upstream `CompanyId`.
   * @example "f0d84a58-e742-ef11-86c3-002248306854"
   */
  id: string;

  /**
   * The formal registered title or name of the tenant entity.
   * Maps directly from upstream `CompanyName`.
   * @example "Orleans Assessors Office"
   */
  name: string;

  /**
   * The tracker integer indexing the absolute highest incremented ticket record identifier.
   * Maps directly from upstream `LastTicketNumber`.
   * @example 6380
   */
  lastTicketNumber: number;

  /**
   * Enum or integer metric classifying corporate operating parameters.
   * Maps directly from upstream `BusinessType`.
   * @example 0
   */
  businessType: number;
}
