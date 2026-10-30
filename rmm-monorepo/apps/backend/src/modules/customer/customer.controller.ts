import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerEntity } from '@repo/database';
import { CustomerResponseDto } from './dto/customer-response.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async getAllCustomers(): Promise<CustomerResponseDto[]> {
    return this.customerService.findAll();
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async triggerManualSync() {
    await this.customerService.syncFromMsp();
    return {
      statusCode: HttpStatus.OK,
      message: 'Manual customer synchronization pipeline executed successfully.',
    };
  }
}
