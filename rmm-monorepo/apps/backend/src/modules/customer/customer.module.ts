import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CustomerEntity } from '@repo/database';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';

@Module({
  imports: [
    // Binds the entity mapping metadata context into the scope of this engine block
    MikroOrmModule.forFeature([CustomerEntity]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService], // 🚨 Mandatory: Exports provider so SyncCronService can parse it
})
export class CustomersModule {}
