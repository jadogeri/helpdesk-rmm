// apps/backend/src/modules/tickets/ticket.mapper.ts

import { IApiMapper } from '../../common/interfaces/mapper.interface';
import { ITicket, ITicketODataPayload } from '@repo/types';
import { CreateTicketDto } from './dto/create-ticket.dto';

export class TicketApiMapperClass implements IApiMapper<CreateTicketDto, ITicketODataPayload, ITicket> {
  
  toApiPayload(dto: CreateTicketDto): ITicketODataPayload {
    const rawDto = dto as any;
    
    return {
      title: dto.title || rawDto.Title,
      description: dto.description || rawDto.Description || 'No description provided.',
      dueDate: dto.dueDate || rawDto.DueDate || null,
      serviceItemId: dto.serviceItemId || rawDto.ServiceItemId,
      contactId: dto.contactId || rawDto.ContactId,
      locationId: dto.locationId || rawDto.LocationId,
      issueTypeId: dto.issueTypeId || rawDto.IssueTypeId || null,
      projectId: dto.projectId || rawDto.ProjectId || null,
      ticketPriorityCode: dto.ticketPriorityCode || rawDto.TicketPriorityCode || 2,
    };
  }

  toDomain(apiRaw: any): ITicket {
    if (!apiRaw) return null as any;
    
    return {
      ticketId: apiRaw.TicketId,
      title: apiRaw.Title,
      description: apiRaw.Description,
      dueDate: apiRaw.DueDate,
      ticketPriorityCode: apiRaw.TicketPriorityCode,
      serviceItemId: apiRaw.ServiceItemId,
      contactId: apiRaw.ContactId,
      locationId: apiRaw.LocationId,
      issueTypeId: apiRaw.IssueTypeId,
      projectId: apiRaw.ProjectId,
    };
  }
}

// Export as a clean functional singleton instance
export const TicketApiMapper = new TicketApiMapperClass();
