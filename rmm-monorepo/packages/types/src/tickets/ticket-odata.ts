// packages/types/src/odata/ticket-odata.interface.ts

export interface ITicketODataPayload {
  title: string;
  description: string;
  dueDate: string | null;
  serviceItemId: string | number;
  contactId: string | number;
  locationId: string | number;
  issueTypeId: string | number | null;
  projectId: string | number | null;
  ticketPriorityCode: number;
}
