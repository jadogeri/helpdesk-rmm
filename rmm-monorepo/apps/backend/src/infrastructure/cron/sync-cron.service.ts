// apps/backend/src/modules/sync/sync-cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IMspSyncer } from '../../common/interfaces/msp-sync.interface';
import { CustomerService } from '../../modules/customer/customer.service';
import { ContactService } from '../../modules/contact/contact.service';
import { UserService } from '../../modules/user/user.service';
import { LocationService } from '../../modules/location/location.service';
import { ServiceItemService } from '../../modules/service-item/service-item.service';
import { IssueTypeService } from '../../modules/issue-type/issue-type.service';
import { CompanyService } from '../../modules/company/company.service';
import { TicketCustomStatusService } from '../../modules/ticket-custom-status/ticket-custom-status.service';

@Injectable()
export class SyncCronService {
  private readonly logger = new Logger(SyncCronService.name);

  constructor(
    private readonly companyService: CompanyService,
    private readonly customerService: CustomerService,
    private readonly locationService: LocationService,
    private readonly issueTypeService: IssueTypeService,
    private readonly ticketCustomStatusService: TicketCustomStatusService,  
    private readonly serviceItemService: ServiceItemService,
    private readonly contactService: ContactService,
    private readonly usersService: UserService
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async runNightlySync() {
    this.logger.log('🚀 Starting global type-safe synchronization pipeline pass...');
    console.log('Starting nightly sync...');

    // 🧱 Strongly typed dependency array! Order matters for Foreign Key constraints
    const sequentialSyncers: IMspSyncer[] = [
      this.companyService,
      this.customerService,
      this.locationService,
      this.issueTypeService,
      this.ticketCustomStatusService,
      this.serviceItemService,
      this.contactService,
      this.usersService
    ];

    for (const syncer of sequentialSyncers) {
      try {
        // Guaranteed to exist and return a Promise<void> by the IMspSyncer interface contract
        await syncer.syncFromMsp();
      } catch (error) {
        this.logger.error(`❌ Sync pass step failed for provider: ${syncer.constructor.name}`, error);
        // Continue or throw depending on how strictly you want errors to halt the remaining sync stack
      }
    }

    this.logger.log('✅ Global sync loop complete.');
  }
}
