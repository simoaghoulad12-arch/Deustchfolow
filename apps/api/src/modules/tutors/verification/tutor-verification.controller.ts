import { Body, Controller, Get, Param, Patch, Post, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { UserRole, type AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { TutorVerificationService } from './tutor-verification.service';
import { UploadVerificationDocumentDto } from '../dto/upload-verification-document.dto';
import { AdminVerificationDecisionDto } from '../dto/admin-verification-decision.dto';

@Controller()
export class TutorVerificationController {
  constructor(private readonly verificationService: TutorVerificationService) {}

  @Post('tutors/me/verification/documents')
  @Roles(UserRole.TUTOR)
  uploadDocument(@CurrentUser() user: AuthenticatedUser, @Body() dto: UploadVerificationDocumentDto) {
    return this.verificationService.uploadDocument(user.id, dto);
  }

  @Get('tutors/me/verification/documents')
  @Roles(UserRole.TUTOR)
  listOwnDocuments(@CurrentUser() user: AuthenticatedUser) {
    return this.verificationService.listOwnDocuments(user.id);
  }

  @Get('tutors/me/verification/documents/:documentId/content')
  @Roles(UserRole.TUTOR)
  async getOwnDocumentContent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('documentId') documentId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { buffer, contentType } = await this.verificationService.getOwnDocumentContent(user.id, documentId);
    res.set({ 'Content-Type': contentType, 'Content-Disposition': 'inline' });
    return new StreamableFile(buffer);
  }

  @Post('tutors/me/verification/submit')
  @Roles(UserRole.TUTOR)
  submitForReview(@CurrentUser() user: AuthenticatedUser) {
    return this.verificationService.submitForReview(user.id);
  }

  @Get('tutors/admin/verification/queue')
  @Roles(UserRole.ADMIN)
  adminListQueue() {
    return this.verificationService.adminListQueue();
  }

  @Get('tutors/admin/verification/:tutorId/documents')
  @Roles(UserRole.ADMIN)
  adminListDocumentsForTutor(@Param('tutorId') tutorId: string) {
    return this.verificationService.adminListDocumentsForTutor(tutorId);
  }

  @Get('tutors/admin/verification/documents/:documentId/content')
  @Roles(UserRole.ADMIN)
  async getDocumentContentForAdmin(
    @Param('documentId') documentId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { buffer, contentType } = await this.verificationService.getDocumentContentForAdmin(documentId);
    res.set({ 'Content-Type': contentType, 'Content-Disposition': 'inline' });
    return new StreamableFile(buffer);
  }

  @Patch('tutors/admin/verification/:tutorId')
  @Roles(UserRole.ADMIN)
  adminDecide(@Param('tutorId') tutorId: string, @Body() dto: AdminVerificationDecisionDto) {
    return this.verificationService.adminDecide(tutorId, dto);
  }
}
