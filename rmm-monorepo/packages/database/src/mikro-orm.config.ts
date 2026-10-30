// packages/database/mikro-orm.config.ts
import { ContactEntity } from './entities/contact.entity';
import { UserEntity } from './entities/user.entity';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

import { CustomerEntity } from './entities/customer.entity';
import { LocationEntity } from './entities/location.entity';
import { IssueTypeEntity } from './entities/issue-type.entity';
import { CompanyEntity } from './entities/company.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { TicketCustomStatusEntity } from './entities/ticket-custom-status.entity';
import { ServiceItemEntity } from './entities/service-item.entity';

// Force load the environment file from your monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const databaseConfig = defineConfig({
  host: '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME,  
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  entities: [CustomerEntity, LocationEntity, IssueTypeEntity, CompanyEntity, 
    TicketCustomStatusEntity, ServiceItemEntity, ContactEntity, UserEntity], 
  debug: process.env.NODE_ENV === 'development',
  extensions: [Migrator],
  migrations: {
    path: './src/migrations', 
    pathTs: './src/migrations',
  },
});

export default databaseConfig;
