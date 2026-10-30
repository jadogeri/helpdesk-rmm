import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { IssueTypeEntity } from '@repo/database';
import { IssueTypeService } from './issue-type.service';
import { IssueTypeController } from './issue-type.controller';
import { HelpdeskClientModule } from '../helpdesk-client/helpdesk-client.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([IssueTypeEntity]),
    HelpdeskClientModule, // Grants access to HelpdeskClientService HTTP client engine
  ],
  controllers: [IssueTypeController],
  providers: [IssueTypeService],
  exports: [IssueTypeService], // 🚨 Mandatory: Exports provider so your sync cron module can access it
})
export class IssueTypesModule {}
