import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { IssueTypeService } from './issue-type.service';
import { IssueTypeResponseDto } from './dto/issue-types-response.dto';

@Controller('issue-types')
export class IssueTypeController {
  constructor(private readonly issueTypesService: IssueTypeService) {}

  /**
   * 🟢 HTTP GET: Returns your fully pre-structured tree hierarchy array instantly out of local storage cache
   * Route: GET /issue-types
   */
  @Get()
  async getIssueTypes(): Promise<IssueTypeResponseDto[]> {
    return await this.issueTypesService.getIssueTypes();
  }


  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async triggerManualSync() {
    return await this.issueTypesService.syncAllIssueTypesFromMsp();
  }
}
