import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { TicketCustomStatusEntity } from '@repo/database';
import { TicketCustomStatusService } from './ticket-custom-status.service';

import { HelpdeskClientModule } from '../helpdesk-client/helpdesk-client.module';
import { TicketCustomStatusController } from './ticket-custom-status.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([TicketCustomStatusEntity, ]),
    HelpdeskClientModule, // Grants access to HelpdeskClientService HTTP client engine
  ],
  controllers: [TicketCustomStatusController],
  providers: [TicketCustomStatusService],
  exports: [TicketCustomStatusService], // 🚨 Mandatory: Exports provider so your sync cron module can access it
})
export class TicketCustomStatusModule {}
