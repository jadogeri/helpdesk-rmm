// apps/backend/src/modules/tickets/ticket.mapper.ts

import { IApiMapper } from '../../common/interfaces/mapper.interface';
import { ITicket, ITicketODataPayload } from '@repo/types';
import { CreateTicketDto } from './dto/create-ticket.dto';

export class TicketApiMapperClass implements IApiMapper<CreateTicketDto, ITicketODataPayload, ITicket> {
  
  toApiPayload(dto: CreateTicketDto): ITicketODataPayload {
    const rawDto = dto as any;
    
    return {
      Title: dto.title || rawDto.Title,
      Description: dto.description || rawDto.Description || 'No description provided.',
      DueDate: dto.dueDate || rawDto.DueDate || null,
      ServiceItemId: dto.serviceItemId || rawDto.ServiceItemId, 
      ContactId: dto.contactId || rawDto.ContactId,
      LocationId: dto.locationId || rawDto.LocationId,
      IssueTypeId: dto.issueTypeId || rawDto.IssueTypeId || null,
      ProjectId: dto.projectId || rawDto.ProjectId || null,
      TicketPriorityCode: dto.ticketPriorityCode || rawDto.TicketPriorityCode || 1,
      IsBillable: true,
      IsTaxable: false,
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
