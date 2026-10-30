import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CreatePortalTicketDto,
  PortalTicketCloseDto,
  PortalTicketLookupDto,
  PortalTicketResponseDto,
} from './dto/create-ticket.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor( @Inject(TicketsService) private readonly ticketsService: TicketsService) {}

  @Post('portal')
  async createPortalTicket(@Body() createTicketDto: CreatePortalTicketDto) {
    return this.ticketsService.createPortal(createTicketDto);
  }

  @Get('portal/knowledge-base')
  async searchKnowledgeBase(@Query('q') query: string) {
    return this.ticketsService.searchPublicKnowledgeBase(query);
  }

  @Post('portal/lookup')
  async lookupPortalTicket(@Body() request: PortalTicketLookupDto) {
    return this.ticketsService.lookupPortalTicket(request.reference, request.email);
  }

  @Post('portal/:ticketId/responses')
  async addPortalResponse(
    @Param('ticketId') ticketId: string,
    @Body() response: PortalTicketResponseDto,
  ) {
    return this.ticketsService.addPortalResponse(ticketId, response);
  }

  @Post('portal/:ticketId/close')
  async requestPortalClose(
    @Param('ticketId') ticketId: string,
    @Body() request: PortalTicketCloseDto,
  ) {
    return this.ticketsService.requestPortalClose(ticketId, request);
  }

  @Post('portal/:ticketId/attachments')
  @UseInterceptors(
    FileInterceptor('attachment', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        const allowedTypes = [
          'image/png',
          'image/jpeg',
          'image/webp',
          'audio/webm',
          'audio/ogg',
          'audio/mp4',
          'audio/mpeg',
          'audio/wav',
          'audio/x-wav',
        ];
        callback(
          allowedTypes.includes(file.mimetype)
            ? null
            : new BadRequestException('Choose a PNG, JPG, WebP image or supported audio note.'),
          allowedTypes.includes(file.mimetype),
        );
      },
    }),
  )
  async uploadAttachment(
    @Param('ticketId') ticketId: string,
    @Body('email') email: string,
    @UploadedFile()
    file?: { originalname: string; mimetype: string; buffer: Buffer },
  ) {
    if (!file) {
      throw new BadRequestException('Choose an image to attach to the ticket.');
    }
    return this.ticketsService.uploadPortalAttachment(ticketId, email, file);
  }
}
