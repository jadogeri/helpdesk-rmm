// import { Module } from '@nestjs/common';
// import { CacheConfigModule } from './infrastructure/cache/cache-config.module';
// import { IssueTypesModule } from './modules/issue-type/issue-type.module';
// import { UserModule } from './modules/user/user.module';
// import { MikroOrmModule } from '@mikro-orm/nestjs';
// import { ConfigModule } from '@nestjs/config';
// import { ScheduleModule } from '@nestjs/schedule'; 
// import { databaseConfig } from '@repo/database';
// import { AppController } from './app.controller';
// import { TicketsModule } from './modules/tickets/tickets.module';
// import { HelpdeskClientModule } from './modules/helpdesk-client/helpdesk-client.module';
// import { LocationsModule } from './modules/location/location.module';
// import { SyncCronModule } from './infrastructure/cron/sync-cron.module';
// import { CustomersModule } from './modules/customer/customer.module';
// import { TicketCustomStatusModule } from './modules/ticket-custom-status/ticket-custom-status.module';
// import { ContactModule } from './modules/contact/contact.module';
// import { APP_GUARD } from '@nestjs/core/constants';
// import { IpStrictThrottlerGuard } from './infrastructure/security/guards/ip-strict.guard';
// import { ThrottlerModule } from '@nestjs/throttler'; // 👈 1. Import ThrottlerModule
// import { DeviceFlexibleThrottlerGuard } from './infrastructure/security/guards/device-flexible.guard';

// @Module({
//   imports: [
//     ConfigModule.forRoot({ isGlobal: true }),
//     CacheConfigModule,
//     ScheduleModule.forRoot(), 
//     MikroOrmModule.forRoot(databaseConfig),
    
//     // 👈 2. Configure ThrottlerModule with named options or global defaults
//     ThrottlerModule.forRoot([
//       {
//         name: 'short',
//         ttl: 1000,     // 1 second window
//         limit: 3,      // limit requests per second
//       },
//       {
//         name: 'long',
//         ttl: 60000,    // 1 minute window
//         limit: 100,    // limit requests per minute
//       }
//     ]),

//     HelpdeskClientModule,
//     CustomersModule,
//     TicketsModule,
//     LocationsModule,
//     IssueTypesModule,
//     TicketCustomStatusModule,
//     ContactModule,
//     UserModule,
//     SyncCronModule, 
//   ],
//   controllers: [AppController],
//   providers: [
//     // Register Guard 1: Blocks bot IPs aggressively 
//     {
//       provide: APP_GUARD,
//       useClass: IpStrictThrottlerGuard,
//     },
//     // Register Guard 2: Protects students/shared networks
//     {
//       provide: APP_GUARD,
//       useClass: DeviceFlexibleThrottlerGuard,
//     },
//   ],
// })
// export class AppModule {}

// app.module.ts
import { Module } from '@nestjs/common';
import { CacheConfigModule } from './infrastructure/cache/cache-config.module';
import { IssueTypesModule } from './modules/issue-type/issue-type.module';
import { UserModule } from './modules/user/user.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule'; 
import { databaseConfig } from '@repo/database';
import { AppController } from './app.controller';
import { TicketsModule } from './modules/tickets/tickets.module';
import { HelpdeskClientModule } from './modules/helpdesk-client/helpdesk-client.module';
import { LocationsModule } from './modules/location/location.module';
import { SyncCronModule } from './infrastructure/cron/sync-cron.module';
import { CustomersModule } from './modules/customer/customer.module';
import { TicketCustomStatusModule } from './modules/ticket-custom-status/ticket-custom-status.module';
import { ContactModule } from './modules/contact/contact.module';
import { APP_GUARD } from '@nestjs/core/constants';
import { IpStrictThrottlerGuard } from './infrastructure/security/guards/ip-strict.guard';
import { ThrottlerModule } from '@nestjs/throttler'; 
import { DeviceFlexibleThrottlerGuard } from './infrastructure/security/guards/device-flexible.guard';

@Module({
  imports: [
    CacheConfigModule,
    ScheduleModule.forRoot(), 
    MikroOrmModule.forRoot(databaseConfig),
    
    // 🛡️ CRITICAL PRODUCTION FIX: Align profiles with your custom security guard keys
    ThrottlerModule.forRoot([
      {
        name: 'ip_strict',
        ttl: 60000,    // 1 minute window
        limit: 100,    // Limit aggregate requests per minute across target IP ceiling
      },
      {
        name: 'device_flexible',
        ttl: 60000,    // 1 minute window
        limit: 20,     // Limit individual user device signatures safely
      }
    ]),

    HelpdeskClientModule,
    CustomersModule,
    TicketsModule,
    LocationsModule,
    IssueTypesModule,
    TicketCustomStatusModule,
    ContactModule,
    UserModule,
    SyncCronModule, 
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: IpStrictThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: DeviceFlexibleThrottlerGuard,
    },
  ],
})
export class AppModule {}
