// apps/backend/src/modules/tickets/tickets.service.ts

import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ContactEntity, LocationEntity, IssueTypeEntity } from '@repo/database';
import { ITicket, ITicketODataPayload } from '@repo/types';
import { API_ENDPOINTS } from '@repo/constants';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

// 🟢 Setup explicit incoming OData wrapper interfaces to prevent 'any' type escapes
interface IODataCollectionWrapper<T> {
  '@odata.context'?: string;
  value: T[];
}

interface TicketAttachmentFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @Inject(HelpdeskClientService) 
    private readonly helpdeskClient: HelpdeskClientService,

    @InjectRepository(ContactEntity)
    private readonly contactRepo: EntityRepository<ContactEntity>,

    @InjectRepository(LocationEntity)
    private readonly locationRepo: EntityRepository<LocationEntity>,

    @InjectRepository(IssueTypeEntity)
    private readonly issueTypeRepo: EntityRepository<IssueTypeEntity>
  ) {}

  /**
   * 🟢 Helper Method: Maps dirty upstream PascalCase OData properties 
   * down to your application's clean ITicket camelCase contract.
   */
  private mapToInternalTicket(raw: any): ITicket {
    return {
      ticketId: raw.TicketId,
      title: raw.Title,
      description: raw.Description,
      dueDate: raw.DueDate,
      ticketPriorityCode: raw.TicketPriorityCode,
      serviceItemId: raw.ServiceItemId,
      contactId: raw.ContactId,
      locationId: raw.LocationId,
      issueTypeId: raw.IssueTypeId,
      projectId: raw.ProjectId,
    };
  }

  async create(createTicketDto: CreateTicketDto): Promise<ITicket> {
    this.logger.log(`🔍 Validating relational references for new ticket title: "${createTicketDto.title}"`);

    const rawDto = createTicketDto as any;
    const contactId = createTicketDto.contactId || rawDto.ContactId;
    const locationId = createTicketDto.locationId || rawDto.LocationId;
    const issueTypeId = createTicketDto.issueTypeId || rawDto.IssueTypeId;
    const serviceItemId = createTicketDto.serviceItemId || rawDto.ServiceItemId;
    const projectId = createTicketDto.projectId || rawDto.ProjectId;
    const title = createTicketDto.title || rawDto.Title;
    const description = createTicketDto.description || rawDto.Description;
    const dueDate = createTicketDto.dueDate || rawDto.DueDate;
    const priorityCode =
      createTicketDto.ticketPriorityCode ?? rawDto.ticketPriorityCode ?? 1;

    const [contactExists, locationExists] = await Promise.all([
      this.contactRepo.findOne({ id: contactId }),
      this.locationRepo.findOne({ id: locationId })
    ]);

    if (!contactExists)   throw new BadRequestException(`Target Contact ID [${contactId}] is completely invalid.`);
    if (!locationExists)  throw new BadRequestException(`Target Location ID [${locationId}] is completely invalid.`);

    if (issueTypeId) {
      const issueTypeExists = await this.issueTypeRepo.findOne({ id: issueTypeId });
      if (!issueTypeExists) {
        throw new BadRequestException(`Target Issue Type ID [${issueTypeId}] does not exist.`);
      }
    }

    const odataPayload: ITicketODataPayload = {
      Title: title,
      Description: description || 'No description provided.',
      DueDate: dueDate || null,
      ServiceItemId: serviceItemId, 
      ContactId: contactId,
      LocationId: locationId,
      IssueTypeId: issueTypeId || null,
      ProjectId: projectId || null,
      TicketPriorityCode: priorityCode,
      IsBillable: true,
      IsTaxable: false,
    };

    this.logger.log(`🚀 Sending payload to MSP Manager API...`);
    
    // MSP API returns a single ticket object on POST actions
    const response = await this.helpdeskClient.post<any>(API_ENDPOINTS.UPSTREAM.TICKETS.BASE, odataPayload);
    //return this.mapToInternalTicket(response);
    return response;

  }

  async uploadAttachment(
    ticketId: string,
    file: TicketAttachmentFile,
  ): Promise<unknown> {
    const formData = new FormData();
    formData.append(
      'attachment',
      new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }),
      file.originalname,
    );
    return this.helpdeskClient.postMultipart(
      API_ENDPOINTS.UPSTREAM.TICKETS.ATTACHMENT(ticketId),
      formData,
    );
  }

  async findAll(): Promise<ITicket[]> {
    this.logger.log(`Fetching active tickets tree from: ${API_ENDPOINTS.UPSTREAM.TICKETS.ALL_FILTERED}`);
    
    // 🟢 1. Point the client container type to expect the wrapper object structure
    const response = await this.helpdeskClient.get<IODataCollectionWrapper<any>>(
      //API_ENDPOINTS.UPSTREAM.TICKETS.ALL_FILTERED
      API_ENDPOINTS.UPSTREAM.TICKETS.ALL_FILTERED
    );

    // 🟢 2. Safely fall back if the array wrapper is missing
    if (!response || !response.value) {
      return [];
    }

    // 🟢 3. Map across the raw items to drop them down to camelCase
    return response.value;
    // return response.value.map(ticket => this.mapToInternalTicket(ticket));
  }

  async findOne(id: string): Promise<ITicket> {
    const response = await this.helpdeskClient.get<any>(API_ENDPOINTS.UPSTREAM.TICKETS.BY_ID(id));
    return this.mapToInternalTicket(response);
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<ITicket> {
    this.logger.log(`Updating ticket ID [${id}] structure payload...`);
    const response = await this.helpdeskClient.patch<any>(API_ENDPOINTS.UPSTREAM.TICKETS.BY_ID(id), updateTicketDto);
    return this.mapToInternalTicket(response);
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing remote ticket entry pointer ID [${id}]...`);
    return await this.helpdeskClient.delete(API_ENDPOINTS.UPSTREAM.TICKETS.BY_ID(id));
  }

}
