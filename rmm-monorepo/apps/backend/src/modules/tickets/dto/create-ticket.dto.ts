// apps/backend/src/modules/tickets/dto/create-ticket.dto.ts
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CreateTicketPayload } from '@repo/types';

export class CreateTicketDto implements CreateTicketPayload {
  @ApiProperty({
    description: 'The display title of the support request',
    example: 'System login failure',
  })
  title!: string;

  @ApiPropertyOptional({
    description: 'The ISO standard target deadline string',
    example: '2026-12-31T23:59:59.000Z',
  })
  dueDate?: string | null;

  @ApiProperty({ description: 'Associated system service item UUID' })
  serviceItemId!: string;

  @ApiProperty({ description: 'Unique contact registration key' })
  contactId!: string;

  @ApiProperty({ description: 'Target business location profile identifier' })
  locationId!: string;

  @ApiProperty({ description: 'Helpdesk categorization taxonomy key' })
  issueTypeId!: string;

  @ApiProperty({ description: 'Associated organization project identifier' })
  projectId!: string;

  @ApiPropertyOptional({ description: 'Detailed technical logging context' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Numerical processing triage weight',
    example: 1,
  })
  ticketPriorityCode?: number;
}

export class CreatePortalTicketDto extends OmitType(CreateTicketDto, ['contactId'] as const) {
  @ApiProperty({
    description: 'Email address on the MSP Manager contact profile for this request',
    example: 'alex@example.com',
  })
  email!: string;
}

export class PortalTicketAccessDto {
  @ApiProperty({ description: 'Email address on the MSP Manager contact profile' })
  email!: string;
}

export class PortalTicketLookupDto extends PortalTicketAccessDto {
  @ApiProperty({ description: 'Ticket number or ticket UUID' })
  reference!: string;
}

export class PortalTicketResponseDto extends PortalTicketAccessDto {
  @ApiProperty({ description: 'Public reply text from the contact' })
  description!: string;

  @ApiPropertyOptional({ description: 'Optional email addresses to copy on this reply' })
  cc?: string[];
}

export class PortalTicketCloseDto extends PortalTicketResponseDto {
  @ApiPropertyOptional({ description: 'Optional customer rating from 1 to 5' })
  rating?: number;
}
