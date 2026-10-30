import { ContactEntity } from '@repo/database';
import { IMapper } from '../../../common/interfaces/mapper.interface';
import { ContactResponseDto } from '../dto/contact-response.dto';
import { IContact } from '@repo/types/src/contacts/contact';

export class ContactsMapper implements IMapper<ContactEntity, ContactResponseDto> {
  toDomain(entity: ContactEntity): ContactResponseDto {
    const dto = new ContactResponseDto();
    // 🟢 FIXED: Use unified lowercase id matching your entity primary key
    dto.id = entity.id; 
    dto.firstName = entity.firstName;
    dto.lastName = entity.lastName;
    dto.emailAddress = entity.emailAddress;
    dto.phoneMobile = entity.phoneMobile || '';
    dto.companyId = entity.companyId;   // Evaluates getter safely
    dto.locationId = entity.locationId; // Evaluates getter safely
    return dto;
  }

  toEntity(domain: ContactResponseDto): ContactEntity {
    const entity = new ContactEntity();
    entity.id = domain.id;
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.emailAddress = domain.emailAddress;
    entity.phoneMobile = domain.phoneMobile;
    
    // 🟢 FIXED: Map direct strings to relationship fields to bypass read-only getter errors
    entity.company = domain.companyId ? (domain.companyId as any) : null;
    entity.location = domain.locationId ? (domain.locationId as any) : null;
    return entity;
  }

  /**
   * Translates a clean Domain model object directly into a flat payload 
   * format that MikroORM bulk operations understand perfectly.
   */
  public static toDBPayload(contact: IContact) {
    return {
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      emailAddress: contact.emailAddress,
      phoneMobile: contact.phoneMobile,
      company: contact.companyId || null,   // Bridges domain key to ORM mapping
      location: contact.locationId || null, // Bridges domain key to ORM mapping
    };
  }
}
