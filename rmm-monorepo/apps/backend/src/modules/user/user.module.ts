import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserEntity } from '@repo/database';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { HelpdeskClientModule } from '../helpdesk-client/helpdesk-client.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([UserEntity]), 
    HelpdeskClientModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // 🚨 Exported for injection by SyncCronService inside SyncModule
})
export class UserModule {}
