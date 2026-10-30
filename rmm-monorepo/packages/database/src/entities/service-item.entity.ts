import { Entity, Property, PrimaryKey, ManyToOne, Rel } from '@mikro-orm/core';
import { CustomerEntity } from './customer.entity'; // 🟢 FIXED: Points to singular file reference
import { IServiceItem } from '@repo/types';

@Entity({ tableName: 'service_items' })
// 🟢 FIXED: Class renamed to singular variant matching entity design principles
export class ServiceItemEntity implements IServiceItem {
  @PrimaryKey({ type: 'uuid', fieldName: 'ServiceItemId' })
  id!: string;

  @Property({ type: 'string', fieldName: 'ServiceItemName' })
  name!: string;

  @Property({ type: 'integer', fieldName: 'ServiceItemTypeCode' })
  typeCode!: number;

  // 🟢 FIXED: Updated to point to singular CustomerEntity class metadata
  @ManyToOne(() => CustomerEntity, {
    fieldName: 'CustomerId',
    nullable: true,
    deleteRule: 'set null',
  })
  customer?: Rel<CustomerEntity> | null;

  // Maintains contract compliance with your shared interface primitive key
  // 🟢 FIXED: Reads '.id' from CustomerEntity to conform with lowercase standards
  get customerId(): string {
    return this.customer?.id ?? '';
  }
}
