// apps/backend/src/modules/tickets/tickets.service.ts

import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { raw } from '@mikro-orm/core';
import { ContactEntity, LocationEntity, IssueTypeEntity } from '@repo/database';
import { ITicket, ITicketODataPayload } from '@repo/types';
import { API_ENDPOINTS } from '@repo/constants';
import { HelpdeskClientService } from '../helpdesk-client/helpdesk-client.service';
import {
  CreateTicketDto,
  CreatePortalTicketDto,
  PortalTicketCloseDto,
  PortalTicketResponseDto,
} from './dto/create-ticket.dto';

interface TicketAttachmentFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

interface PortalContact {
  id: string;
  locationId: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
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

  private async create(createTicketDto: CreateTicketDto): Promise<ITicket> {
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
      createTicketDto.ticketPriorityCode ?? rawDto.ticketPriorityCode ?? 2;
    if (!Number.isInteger(priorityCode) || priorityCode < 1 || priorityCode > 5) {
      throw new BadRequestException('Priority must be a number from 1 to 5.');
    }
    if (!title?.trim() || title.length > 160) {
      throw new BadRequestException('Ticket title must be between 1 and 160 characters.');
    }
    if (!description?.trim() || description.length > 4000) {
      throw new BadRequestException('Ticket description must be between 1 and 4,000 characters.');
    }

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
      title,
      description,
      dueDate: dueDate || null,
      serviceItemId,
      contactId,
      locationId,
      issueTypeId: issueTypeId || null,
      projectId: projectId || null,
      ticketPriorityCode: priorityCode,
    };

    this.logger.log(`🚀 Sending payload to MSP Manager API...`);
    
    // MSP API returns a single ticket object on POST actions
    const response = await this.helpdeskClient.post<any>(API_ENDPOINTS.UPSTREAM.TICKETS.BASE, odataPayload);
    //return this.mapToInternalTicket(response);
    return response;

  }

  private async resolvePortalContact(email: string): Promise<PortalContact> {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new BadRequestException('Enter the email address on your service-desk contact profile.');
    }

    const contact = await this.contactRepo.findOne({
      [raw('LOWER(TRIM("EmailAddress"))')]: normalizedEmail,
    });
    if (!contact) {
      throw new NotFoundException('No service-desk contact matches that email address.');
    }
    return contact;
  }

  async createPortal(dto: CreatePortalTicketDto): Promise<unknown> {
    const contact = await this.resolvePortalContact(dto.email);
    const ticket = await this.create({
      ...dto,
      contactId: contact.id,
      locationId:
        dto.locationId && dto.locationId !== '00000000-0000-0000-0000-000000000000'
          ? dto.locationId
          : contact.locationId,
    });
    return ticket;
  }

  private async getOwnedTicket(ticketId: string, email: string) {
    const reference = ticketId?.trim();
    const isUuid = /^[0-9a-f-]{36}$/i.test(reference);
    const isTicketNumber = /^\d{1,20}$/.test(reference);
    if (!isUuid && !isTicketNumber) {
      throw new NotFoundException('Ticket not found for this contact.');
    }

    const contact = await this.resolvePortalContact(email);
    let ticket: any;
    try {
      if (isUuid) {
        ticket = await this.helpdeskClient.get<any>(
          API_ENDPOINTS.UPSTREAM.TICKETS.BY_ID(reference),
        );
      } else {
        const results = await this.helpdeskClient.get<any>(
          `tickets?$filter=ticketNumber eq ${Number(reference)}&$top=10`,
        );
        const records = Array.isArray(results) ? results : results?.value ?? [];
        ticket = records.length === 1 ? records[0] : undefined;
      }
    } catch {
      throw new NotFoundException('Ticket not found for this contact.');
    }

    const ownerContactId = ticket?.ContactId ?? ticket?.contactId;
    if (!ownerContactId || String(ownerContactId).toLowerCase() !== contact.id.toLowerCase()) {
      throw new NotFoundException('Ticket not found for this contact.');
    }
    return { contact, ticket };
  }

  async getPortalTicket(ticketId: string, email: string) {
    const { ticket } = await this.getOwnedTicket(ticketId, email);
    const actualTicketId = ticket.TicketId ?? ticket.ticketId ?? ticketId;
    let statusName =
      ticket.TicketStatusName ??
      ticket.ticketStatusName ??
      ticket.StatusName ??
      ticket.statusName ??
      '';
    if (!statusName) {
      try {
        const status = await this.helpdeskClient.get<any>(
          `tickets/${actualTicketId}/ticketstatus`,
        );
        statusName = status?.Name ?? status?.name ?? '';
      } catch {
        statusName = '';
      }
    }

    let hardwareAssets: Array<{ name: string; status: string }> = [];
    try {
      const assetResult = await this.helpdeskClient.get<any>(
        `tickets/${actualTicketId}/assets`,
      );
      const assets = Array.isArray(assetResult) ? assetResult : assetResult?.value ?? [];
      hardwareAssets = await Promise.all(
        assets.slice(0, 10).map(async (asset: any) => {
          const assetId = asset.AssetId ?? asset.assetId;
          if (!assetId || !/^[0-9a-f-]{36}$/i.test(String(assetId))) return null;
          try {
            const status = await this.helpdeskClient.get<any>(
              `assets(${assetId})/assetstatus`,
            );
            return {
              name: asset.Name ?? asset.name ?? 'Linked device',
              status: status.Name ?? status.name ?? status.Description ?? status.description ?? 'Status unavailable',
            };
          } catch {
            return {
              name: asset.Name ?? asset.name ?? 'Linked device',
              status: 'Status unavailable',
            };
          }
        }),
      ).then((items) => items.filter((item): item is { name: string; status: string } => !!item));
    } catch {
      hardwareAssets = [];
    }

    return {
      ticket: {
        ticketId: ticket.TicketId ?? ticket.ticketId ?? ticketId,
        ticketNumber: ticket.TicketNumber ?? ticket.ticketNumber ?? '',
        title: ticket.Title ?? ticket.title ?? '',
        description: ticket.Description ?? ticket.description ?? '',
        statusName: statusName || 'Status unavailable',
        statusCode: ticket.TicketStatusCode ?? ticket.ticketStatusCode ?? null,
        priorityCode: ticket.TicketPriorityCode ?? ticket.ticketPriorityCode ?? null,
        createdDate: ticket.CreatedDate ?? ticket.createdDate ?? null,
        completedDate: ticket.CompletedDate ?? ticket.completedDate ?? null,
        hardwareAssets,
      },
    };
  }

  async getPortalResponses(ticketId: string, email: string) {
    const { ticket } = await this.getOwnedTicket(ticketId, email);
    const actualTicketId = ticket.TicketId ?? ticket.ticketId ?? ticketId;
    const result = await this.helpdeskClient.get<any>(
      `tickets/${actualTicketId}/responses`,
    );
    const responses = Array.isArray(result) ? result : result?.value ?? [];
    return responses.map((response: any) => ({
      description: response.Description ?? response.description ?? '',
      fromDisplay: response.FromDisplay ?? response.fromDisplay ?? '',
      createdDate: response.CreatedDate ?? response.createdDate ?? null,
    }));
  }

  async lookupPortalTicket(reference: string, email: string) {
    const [ticket, responses] = await Promise.all([
      this.getPortalTicket(reference, email),
      this.getPortalResponses(reference, email),
    ]);
    return { ticket: ticket.ticket, responses };
  }

  async addPortalResponse(ticketId: string, request: PortalTicketResponseDto) {
    const { contact } = await this.getOwnedTicket(ticketId, request.email);
    const description = request.description?.trim();
    if (!description || description.length > 4000) {
      throw new BadRequestException('Reply must be between 1 and 4,000 characters.');
    }
    const cc = request.cc ?? [];
    if (
      !Array.isArray(cc) ||
      cc.length > 5 ||
      cc.some((address) =>
        typeof address !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.trim()),
      )
    ) {
      throw new BadRequestException('Enter up to five valid CC email addresses.');
    }

    const ticketResponseAddressList = [
      ...new Set(cc.map((address) => address.trim().toLowerCase())),
    ].map((address) => ({ address }));

    return this.helpdeskClient.post<any>('ticketresponses', {
      description,
      fromAddress: contact.emailAddress,
      fromDisplay: `${contact.firstName} ${contact.lastName}`.trim(),
      ticketId,
      ticketResponseAddressList,
    });
  }

  async requestPortalClose(ticketId: string, request: PortalTicketCloseDto) {
    await this.getOwnedTicket(ticketId, request.email);
    const reason = request.description?.trim();
    if (!reason || reason.length > 4000) {
      throw new BadRequestException('Add a short reason before closing the ticket.');
    }
    if (request.rating !== undefined && (!Number.isInteger(request.rating) || request.rating < 1 || request.rating > 5)) {
      throw new BadRequestException('Rating must be a whole number from 1 to 5.');
    }

    const closeResponse = [
      `Customer requested ticket closure: ${reason}`,
      request.rating ? `Customer rating: ${request.rating}/5` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
    await this.addPortalResponse(ticketId, {
      email: request.email,
      description: closeResponse,
      cc: request.cc,
    });
    return {
      requested: true,
      message: 'Closure request added to the ticket. The service desk must close it in MSP Manager.',
    };
  }

  async searchPublicKnowledgeBase(query: string) {
    const cleanQuery = query?.trim().toLowerCase();
    if (!cleanQuery || cleanQuery.length < 3) return [];
    if (cleanQuery.length > 160) {
      throw new BadRequestException('Search text is too long.');
    }

    const response = await this.helpdeskClient.get<any>(
      'knowledgebaseitems?$top=30',
    );
    const items = Array.isArray(response) ? response : response?.value ?? [];
    const matches = items
      .filter((item: any) => Number(item.Visibility ?? item.visibility) === 1)
      .map((item: any) => {
        const title = String(item.Name ?? item.name ?? '');
        const normalizedTitle = title.toLowerCase();
        const score = normalizedTitle.includes(cleanQuery)
          ? 3
          : cleanQuery.split(/\s+/).filter((word) => normalizedTitle.includes(word)).length;
        return { item, title, score };
      })
      .filter((match: any) => match.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5);

    return Promise.all(
      matches.map(async ({ item, title }: any) => {
        const id = item.KnowledgeBaseItemId ?? item.knowledgeBaseItemId;
        const fieldResponse = await this.helpdeskClient.get<any>(
          `knowledgebaseitems/${id}/fields`,
        );
        const fields = Array.isArray(fieldResponse)
          ? fieldResponse
          : fieldResponse?.value ?? [];
        const excerpt = fields
          .map((field: any) => field.Value ?? field.value ?? field.DisplayValue ?? '')
          .filter(Boolean)
          .join('\n')
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 800);
        return { title, excerpt };
      }),
    );
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

  async uploadPortalAttachment(
    ticketId: string,
    email: string,
    file: TicketAttachmentFile,
  ) {
    await this.getOwnedTicket(ticketId, email);
    const isImage = file.mimetype.startsWith('image/');
    if (isImage && file.buffer.length > 5 * 1024 * 1024) {
      throw new BadRequestException('Screenshots must be 5 MB or smaller.');
    }
    if (file.buffer.length > 10 * 1024 * 1024) {
      throw new BadRequestException('Attachments must be 10 MB or smaller.');
    }
    return this.uploadAttachment(ticketId, file);
  }

}
