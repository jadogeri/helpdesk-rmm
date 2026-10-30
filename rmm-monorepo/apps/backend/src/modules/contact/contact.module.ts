import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ContactEntity } from '@repo/database';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { HelpdeskClientModule } from '../helpdesk-client/helpdesk-client.module';

@Module({
  imports: [MikroOrmModule.forFeature([ContactEntity]), HelpdeskClientModule],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
