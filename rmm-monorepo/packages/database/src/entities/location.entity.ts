import { Entity, PrimaryKey, Property, ManyToOne, Rel } from '@mikro-orm/core';
import { ILocation } from '@repo/types';
import { CustomerEntity } from './customer.entity'; // 🟢 Points safely to the correct singular file

@Entity({ tableName: 'locations' })
export class LocationEntity implements ILocation { // 🟢 Satisfies the complete contract directly
  @PrimaryKey({ type: 'uuid', fieldName: 'LocationId' })
  id!: string;

  @Property({ type: 'string', fieldName: 'LocationName' })
  name!: string;

  // Maps the customer relationship directly as a foreign key on CustomerId column
  // 🟢 FIXED: Updated from plural CustomersEntity to correct singular CustomerEntity class
  @ManyToOne(() => CustomerEntity, { 
    fieldName: 'CustomerId', 
    deleteRule: 'cascade', // Cascades down automatically if a customer is wiped
    nullable: false 
  })
  customer!: Rel<CustomerEntity>;

  // This getter maintains type compliance with your primitive shared ILocation interface contract
  // 🟢 FIXED: Added to safely resolve the string ID to satisfy your shared architecture types
  get customerId(): string {
    return this.customer?.id ?? '';
  }
}
