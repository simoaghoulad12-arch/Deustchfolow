import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { DocumentChecklistService } from './document-checklist.service';
import { CreateDocumentRequirementDto } from '../dto/create-document-requirement.dto';
import { UpdateDocumentRequirementDto } from '../dto/update-document-requirement.dto';

@Controller('germany/documents')
export class DocumentChecklistController {
  constructor(private readonly documentService: DocumentChecklistService) {}

  @Get()
  listOwn(@CurrentUser() user: AuthenticatedUser) {
    return this.documentService.listOwn(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateDocumentRequirementDto) {
    return this.documentService.create(user.id, dto);
  }

  @Patch(':requirementId')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('requirementId', ParseUUIDPipe) requirementId: string,
    @Body() dto: UpdateDocumentRequirementDto,
  ) {
    return this.documentService.update(user.id, requirementId, dto);
  }

  @Delete(':requirementId')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('requirementId', ParseUUIDPipe) requirementId: string) {
    return this.documentService.remove(user.id, requirementId);
  }
}
