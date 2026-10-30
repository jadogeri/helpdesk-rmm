// apps/backend/src/modules/service-items/service-items.controller.ts
import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ServiceItemService } from './service-item.service';
import { ServiceItemResponseDto } from './dto/service-item-response.dto';

@ApiTags('Service Items')
@Controller('service-items')
export class ServiceItemController {
  constructor(private readonly serviceItemService: ServiceItemService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cached service items' })
  @ApiOkResponse({ type: [ServiceItemResponseDto] })
  async getServiceItems(): Promise<ServiceItemResponseDto[]> {
    return await this.serviceItemService.getServiceItems();
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger sync from MSP Manager' })
  async triggerManualSync() {
    return await this.serviceItemService.syncAllServiceItemsFromMsp();
  }
}
