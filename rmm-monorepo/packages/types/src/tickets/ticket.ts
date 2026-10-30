export interface ITicket {
  ticketId?: string;
  title: string;
  description?: string;
  dueDate: string;
  ticketPriorityCode?: number;
  serviceItemId: string;
  contactId: string;
  locationId: string;
  issueTypeId: string;
  projectId: string;
}

// Helper types for your payloads
export type CreateTicketPayload = Omit<ITicket, 'ticketId'>;
export type UpdateTicketPayload = Partial<CreateTicketPayload>;


/**

export interface ITicket {
  // Core Identifiers
  ticketId?: string;
  title: string;
  description?: string;
  
  // Relational Foreign Keys
  serviceItemId: string;
  contactId: string | null;
  locationId: string | null;
  issueTypeId: string | null;
  projectId: string | null;
  ticketCustomStatusId?: string | null;

  // Status & Priorities
  ticketPriorityCode?: number;
  ticketStatusCode?: number; // 💡 Allow changing status (e.g., Status 8 = Closed)
  
  // Billing & Metrics Metadata
  isBillable?: boolean;
  isTaxable?: boolean;
  timeRounded?: number;

  // Lifecycle Timestamps
  dueDate: string | null;
  completedDate?: string | null; // 💡 Populate dynamically when a ticket is closed
  createdDate?: string;
  updatedDate?: string;

  // System Audit Tracking
  createdBy?: string;
  updatedBy?: string;
}


 * Payload utilized when posting brand new entries.
 * Fields like ticketId, completedDate, audit timestamps, and system counters 
 * are safely omitted because the database layer defaults or populates them automatically.
 
export type CreateTicketPayload = Omit<
  ITicket, 
  'ticketId' | 'createdDate' | 'updatedDate' | 'createdBy' | 'updatedBy' | 'completedDate'
>;


 * Payload utilized for partial updates (PATCH / PUT).
 * Every field becomes optional, allowing a user to change just the status code 
 * or completion timestamp when closing a file.
 *
export type UpdateTicketPayload = Partial<CreateTicketPayload> & {
  ticketStatusCode?: number;
  completedDate?: string | null;
  updatedBy?: string;
};
 */