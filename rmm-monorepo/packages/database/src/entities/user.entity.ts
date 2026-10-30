import { Entity, PrimaryKey, Property, ManyToOne, Rel } from '@mikro-orm/core';
import { IUser } from '@repo/types';
import { CompanyEntity } from './Company.entity';

@Entity({ tableName: 'users' })
export class UserEntity implements IUser {
  // 🟢 Renamed property to 'id', maps perfectly to 'UserId' column
  @PrimaryKey({ type: 'uuid', fieldName: 'UserId' })
  id!: string;

  @Property({ type: 'string', fieldName: 'EmailAddress' })
  emailAddress!: string;

  @Property({ type: 'string', fieldName: 'FirstName' })
  firstName!: string;

  @Property({ type: 'string', fieldName: 'LastName' })
  lastName!: string;

  @Property({ type: 'string', fieldName: 'Status' })
  status!: string;

  @Property({ type: 'boolean', fieldName: 'Enabled' })
  enabled!: boolean;

  @Property({ type: 'string', nullable: true, fieldName: 'LastLogin' })
  lastLogin!: string | null;

  @Property({ type: 'string', nullable: true, fieldName: 'PhoneMobile' })
  phoneMobile!: string | null;

  // Internal ORM object relationship mapping
  @ManyToOne(() => CompanyEntity, {
    fieldName: 'CompanyId',
    nullable: true,
    deleteRule: 'set null',
  })
  company?: Rel<CompanyEntity> | null;

  // 🟢 Satisfies IUser.companyId using lowercase naming conventions
  get companyId(): string {
    return this.company?.id ?? '';
  }
}
