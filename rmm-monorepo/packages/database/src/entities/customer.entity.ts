import { Entity, PrimaryKey, Property, OneToMany, ManyToOne, Collection, Rel } from '@mikro-orm/core';
import { ICustomer } from '@repo/types';
import { LocationEntity } from './Location.entity'; // 🟢 Unified naming conventions to singular
import { CompanyEntity } from './Company.entity';

@Entity({ tableName: 'customers' })
export class CustomerEntity implements ICustomer {
  @PrimaryKey({ type: 'uuid', fieldName: 'CustomerId' })
  id!: string;

  @Property({ type: 'string', fieldName: 'CustomerName' })
  name!: string;

  @Property({ type: 'string', nullable: true, fieldName: 'ReferenceId' })
  referenceId!: string | null;

  @Property({ type: 'uuid', fieldName: 'ProgramLevelId' })
  programLevelId!: string;

  @Property({ type: 'number', fieldName: 'CustomerStatusId' })
  customerStatusId!: number;

  @ManyToOne(() => CompanyEntity, {
    fieldName: 'CompanyId',     // Tracks the physical database column name
    nullable: true,             
    deleteRule: 'set null',     
  })
  company?: Rel<CompanyEntity> | null;

  // This getter maintains type compliance with your primitive shared ICustomer interface contract
  // 🟢 FIXED: Reads '.id' from CompanyEntity to match the lowercase primary key standard
  get companyId(): string | null | undefined {
    return this.company?.id ?? null;
  }

  // 🟢 Bidirectional link tracking the locations array cache context
  @OneToMany(() => LocationEntity, (loc: LocationEntity) => loc.customer)
  locations = new Collection<LocationEntity>(this);
}
