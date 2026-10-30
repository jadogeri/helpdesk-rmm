import { Entity, PrimaryKey, Property, ManyToOne, Rel } from '@mikro-orm/core';
import { IContact } from '@repo/types';
import { CompanyEntity } from './Company.entity';
import { LocationEntity } from './location.entity'; // 🟢 Renamed to singular file/class if refactored

@Entity({ tableName: 'contacts' })
export class ContactEntity implements IContact {
  @PrimaryKey({ type: 'uuid', fieldName: 'ContactId' })
  id!: string;

  @Property({ type: 'string', fieldName: 'FirstName' })
  firstName!: string;

  @Property({ type: 'string', fieldName: 'LastName' })
  lastName!: string;

  @Property({ type: 'string', fieldName: 'EmailAddress' })
  emailAddress!: string;

  @Property({ type: 'string', fieldName: 'PhoneMobile', nullable: true })
  phoneMobile!: string;

  @ManyToOne(() => CompanyEntity, {
    fieldName: 'CompanyId',
    nullable: true,
    deleteRule: 'set null',
  })
  company?: Rel<CompanyEntity> | null;

  @ManyToOne(() => LocationEntity, {
    fieldName: 'LocationId',
    nullable: true,
    deleteRule: 'set null',
  })
  location?: Rel<LocationEntity> | null;

  // Primitives getters ensuring type-compliance with your strict shared structural type contract
  // 🟢 FIXED: Points to the clean, normalized lowercase '.id' properties of the related entities
  get companyId(): string {
    return this.company?.id ?? '';
  }

  get locationId(): string {
    return this.location?.id ?? '';
  }
}
