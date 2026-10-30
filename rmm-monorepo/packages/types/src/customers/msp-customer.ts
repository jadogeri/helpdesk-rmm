// packages/types/src/customer.ts
export interface IMspCustomer {
  CustomerId: string;       // UUID string
  CustomerName: string;
  ReferenceId: string | null;
  ProgramLevelId: string;   // UUID string
  CustomerStatusId: number;
  CompanyId?: string | null;       // Optional, or removed entirely to fix Bad Requests
}
