import { Entity, Property, PrimaryKey, ManyToOne, Rel } from '@mikro-orm/core';
import { CompanyEntity } from './Company.entity'; 
import { ITicketCustomStatus } from '@repo/types';

@Entity({ tableName: 'ticket_custom_statuses' })
export class TicketCustomStatusEntity implements ITicketCustomStatus {
  
  @PrimaryKey({ type: 'uuid', fieldName: 'TicketCustomStatusId' })
  id!: string;

  @Property({ type: 'text', fieldName: 'Name' })
  name!: string;

  @Property({ type: 'text', nullable: true, fieldName: 'Description' })
  description!: string;

  @Property({ type: 'boolean', default: false, fieldName: 'IsDefault' })
  isDefault: boolean = false;

  @Property({ type: 'integer', fieldName: 'TicketStatusCode' })
  ticketStatusCode!: number;

  @ManyToOne(() => CompanyEntity, {
    fieldName: 'CompanyId',
    nullable: true,
    deleteRule: 'set null',
  })
  company?: Rel<CompanyEntity> | null;

  // Maintains strict contract compliance with your shared interface primitive key
  // 🟢 FIXED: Changed return type signature to string (removed | null) and added empty string fallback
  get companyId(): string {
    return this.company?.id ?? '';
  }
}
