import { Controller } from '@nestjs/common';

// Portal contact resolution is performed inside the ticket service; no public
// list/search endpoint should disclose contact IDs or addresses.
@Controller('contacts')
export class ContactController {}
