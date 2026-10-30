// apps/backend/src/modules/locations/locations.module.ts
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { LocationEntity, CustomerEntity } from '@repo/database';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { HelpdeskClientModule } from '../helpdesk-client/helpdesk-client.module'; // Adjust path if necessary

@Module({
  imports: [
    // 🔒 Binds operation scope exclusively to these tables for this module context
    MikroOrmModule.forFeature([LocationEntity, CustomerEntity]),
    HelpdeskClientModule,
  ],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationsModule {}
