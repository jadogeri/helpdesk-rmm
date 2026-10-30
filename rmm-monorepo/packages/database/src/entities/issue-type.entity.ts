import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, Rel } from '@mikro-orm/core';
import { IIssueType } from '@repo/types'; 
import { CompanyEntity } from './company.entity'; // 🟢 Kept file capitalization matching standard

@Entity({ tableName: 'issue_types' })
export class IssueTypeEntity implements IIssueType { 
  @PrimaryKey({ type: 'uuid', fieldName: 'IssueTypeId' })
  id!: string;

  @Property({ type: 'string', fieldName: 'Name' })
  name!: string;

  @Property({ type: 'text', nullable: true, fieldName: 'Description' })
  description!: string | null;

  @Property({ type: 'string', nullable: true, fieldName: 'RmReferenceId' })
  rmReferenceId!: string | null;

  @ManyToOne(() => CompanyEntity, {
    fieldName: 'CompanyId',
    nullable: true,
    deleteRule: 'set null',
  })
  company?: Rel<CompanyEntity> | null;

  // 🟢 FIXED: Updated getter to read '.id' from CompanyEntity to match lowercase primary keys
  get companyId(): string | null {
    return this.company?.id ?? null;
  }

  // 🌲 SELF-REFERENCING RELATIONSHIP LINKS:

  // 🟢 FIXED: Updated target class reference from plural 'IssueTypesEntity' to singular 'IssueTypeEntity'
  @ManyToOne(() => IssueTypeEntity, {
    fieldName: 'ParentIssueTypeId', 
    nullable: true,
    deleteRule: 'cascade', 
  })
  parent?: Rel<IssueTypeEntity> | null;

  // 🟢 FIXED: Updated collection parameters to use correct singular class reference
  @OneToMany(() => IssueTypeEntity, (child: IssueTypeEntity) => child.parent)
  children = new Collection<IssueTypeEntity>(this);
}
