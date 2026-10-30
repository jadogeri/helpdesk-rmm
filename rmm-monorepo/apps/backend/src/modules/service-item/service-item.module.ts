// apps/backend/src/modules/service-items/service-items.module.ts
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ServiceItemEntity } from '@repo/database';
import { ServiceItemService } from './service-item.service';
import { ServiceItemController } from './service-item.controller';
import { HelpdeskClientModule } from '../helpdesk-client/helpdesk-client.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([ServiceItemEntity]),
    HelpdeskClientModule,
  ],
  controllers: [ServiceItemController],
  providers: [ServiceItemService],
  exports: [ServiceItemService],
})
export class ServiceItemModule {}
