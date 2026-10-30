import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor( @Inject(TicketsService) private readonly ticketsService: TicketsService) {}

  @Post()
  async create(@Body() createTicketDto: CreateTicketDto) {
    return await this.ticketsService.create(createTicketDto);
  }

  @Post(':ticketId/attachments')
  @UseInterceptors(
    FileInterceptor('attachment', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async uploadAttachment(
    @Param('ticketId') ticketId: string,
    @UploadedFile()
    file?: { originalname: string; mimetype: string; buffer: Buffer },
  ) {
    if (!file) {
      throw new BadRequestException('Choose an image to attach to the ticket.');
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
      throw new BadRequestException('Only PNG, JPG, and WebP screenshots are supported.');
    }
    return this.ticketsService.uploadAttachment(ticketId, file);
  }

  @Get()
  async findAll() {
    return await this.ticketsService.findAll();
  }

  // 2️⃣ Keep the dynamic route BELOW static routes
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.ticketsService.findOne(id); 
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return await this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.ticketsService.remove(id);
  }
}
