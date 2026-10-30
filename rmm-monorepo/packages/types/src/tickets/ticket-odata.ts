// packages/types/src/odata/ticket-odata.interface.ts

export interface ITicketODataPayload {
  Title: string;
  Description: string;
  DueDate: string | null;
  ServiceItemId: string | number;
  ContactId: string | number;
  LocationId: string | number;
  IssueTypeId: string | number | null;
  ProjectId: string | number | null;
  TicketPriorityCode: number;
  IsBillable: boolean;
  IsTaxable: boolean;
}
