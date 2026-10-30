import { Controller, Get, Post, HttpCode, HttpStatus, NotFoundException, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { ContactResponseDto } from './dto/contact-response.dto';

@ApiTags('contacts')
@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  /**
   * 🟢 HTTP GET: Retrieve all synchronized contact application profiles from local cache storage
   * Route: GET /contacts
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all synchronized contact application profiles from local cache storage' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Array of cached contact profiles fetched successfully.',
    type: [ContactResponseDto] 
  })
  async getContacts(): Promise<ContactResponseDto[]> {
    return await this.contactService.getContacts();
  }

     /**
     * 🟢 HTTP GET: Retrieve a single user profile by their primary email address
     * Route: GET /users/search?email=joseph.adogeri@company.com
     */
    @Get('search')
    @ApiOperation({ summary: 'Retrieve a single contact application profile by their primary email address' })
    @ApiQuery({ name: 'email', example: 'john.smith @company.com', description: 'The exact email address of the target profile' })
    @ApiResponse({ status: HttpStatus.OK, type: ContactResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No synchronized profile found matching that address.' })
    async getContactByEmail(@Query('email') email: string): Promise<ContactResponseDto> {
      console.log(`Received request to fetch contact by email: ${email}`);
      if (!email) {
        throw new NotFoundException('An email query parameter string is required.');
      }
  
      const user = await this.contactService.getContactByEmail(email);
      
      if (!user) {
        throw new NotFoundException(`User with email address "${email}" could not be located inside cache.`);
      }
  
      return user;
    }

  /**
   * 🔴 HTTP POST: Force trigger a manual background synchronization pass pulling fresh contact structures from MSP Manager
   * Route: POST /contacts/sync
   */
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force trigger a manual background synchronization pass pulling fresh contact structures from MSP Manager' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Manual contact synchronization pipeline executed successfully.' 
  })
  async triggerManualSync() {
    await this.contactService.syncFromMsp();
    return { 
      statusCode: HttpStatus.OK, 
      message: 'Contacts database synced successfully.' 
    };
  }
}
