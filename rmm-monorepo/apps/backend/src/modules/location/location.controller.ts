// apps/backend/src/modules/locations/locations.controller.ts
import { Controller, Get, Post, Query, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationResponseDto } from './dto/location-response.dto';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  /**
   * 🟢 HTTP GET: Used by frontend dropdown fields to fetch locations instantly from Docker
   * Route: GET /locations?customerId=bc2351a5-...
   */
  @Get('customer')
  async getLocationsByCustomer(@Query('customerId', new ParseUUIDPipe()) customerId: string) {
    return await this.locationService.getLocationsByCustomer(customerId);
  }

    /**
   * 🟢 HTTP GET: Used by frontend dropdown fields to fetch locations instantly from Docker
   * Route: GET /locations/all
   */
  @Get('')
  async getLocations(): Promise<LocationResponseDto[]> {
    return await this.locationService.getLocations();
  }

  /**
   * 🔴 HTTP POST: Maintenance trigger used by cron tasks or administrators to refresh cache
   * Route: POST /locations/sync
   */
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async triggerManualSync() {
    return await this.locationService.syncAllLocationsFromMsp();
  }
}
