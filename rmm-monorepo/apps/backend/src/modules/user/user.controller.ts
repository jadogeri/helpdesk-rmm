import { Controller } from '@nestjs/common';

// User/contact directory data is kept private; portal identity checks happen
// inside the ticket service without exposing a public directory route.
@Controller('users')
export class UserController {}
