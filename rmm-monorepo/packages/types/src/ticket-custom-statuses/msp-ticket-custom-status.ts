// packages/types/src/ticket.ts
export interface IMspTicketCustomStatus {
  TicketCustomStatusId: string;
  Name: string;
  Description: string;
  IsDefault: boolean;
  TicketStatusCode: number;
  CompanyId: string;
}
