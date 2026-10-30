// packages/types/src/ticket.ts
export interface ITicketCustomStatus {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  ticketStatusCode: number;
  companyId: string;
}
