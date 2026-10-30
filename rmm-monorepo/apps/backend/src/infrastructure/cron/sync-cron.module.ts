import { Module } from '@nestjs/common';
import { SyncCronService } from './sync-cron.service';
import { LocationsModule } from '../../modules/location/location.module';
import { CustomersModule } from '../../modules/customer/customer.module';
import { IssueTypesModule } from '../../modules/issue-type/issue-type.module';
import { CompanyModule } from '../../modules/company/company.module';
import { TicketCustomStatusModule } from '../../modules/ticket-custom-status/ticket-custom-status.module';
import { ServiceItemModule } from '../../modules/service-item/service-item.module';
import { ContactModule } from '../../modules/contact/contact.module';
import { UserModule } from '../../modules/user/user.module';
@Module({
  imports: [
    LocationsModule, 
    CustomersModule, 
    IssueTypesModule, 
    CompanyModule, 
    TicketCustomStatusModule, 
    ServiceItemModule,
    ContactModule,
    UserModule,
  ],
  providers: [SyncCronService], 
})
export class SyncCronModule {}
