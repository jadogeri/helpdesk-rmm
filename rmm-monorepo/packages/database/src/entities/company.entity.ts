import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ICompany } from '@repo/types';

@Entity({ tableName: 'company' })
export class CompanyEntity implements ICompany {
  @PrimaryKey({ type: 'uuid', fieldName: 'CompanyId' })
  id!: string;

  @Property({ type: 'string', fieldName: 'CompanyName' })
  name!: string;

  @Property({ type: 'integer', fieldName: 'LastTicketNumber' })
  lastTicketNumber!: number;

  @Property({ type: 'integer', fieldName: 'BusinessType' })
  businessType!: number;
}
