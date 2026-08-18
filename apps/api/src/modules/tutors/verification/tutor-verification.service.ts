import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { LocalDocumentStorageProvider } from './document-storage.service';
import type { UploadVerificationDocumentDto } from '../dto/upload-verification-document.dto';
import type { AdminVerificationDecisionDto } from '../dto/admin-verification-decision.dto';

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024; // 5MB raw

/** Metadata only — the storageKey (an internal, opaque object reference) never leaves this service. */
const DOCUMENT_METADATA_SELECT = {
  id: true,
  label: true,
  contentType: true,
  uploadedAt: true,
} as const;

@Injectable()
export class TutorVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: LocalDocumentStorageProvider,
  ) {}

  async uploadDocument(tutorId: string, dto: UploadVerificationDocumentDto) {
    await this.assertTutorProfileExists(tutorId);

    const buffer = Buffer.from(dto.dataBase64, 'base64');
    if (buffer.byteLength > MAX_DOCUMENT_BYTES) {
      throw new BadRequestException('Document exceeds the 5MB size limit.');
    }
    if (buffer.byteLength === 0) {
      throw new BadRequestException('Document is empty.');
    }

    const { storageKey } = await this.storage.save(buffer);

    return this.prisma.client.tutorVerificationDocument.create({
      data: { tutorId, label: dto.label, contentType: dto.contentType, storageKey },
      select: DOCUMENT_METADATA_SELECT,
    });
  }

  async listOwnDocuments(tutorId: string) {
    return this.prisma.client.tutorVerificationDocument.findMany({
      where: { tutorId },
      select: DOCUMENT_METADATA_SELECT,
      orderBy: { uploadedAt: 'desc' },
    });
  }

  /** Ownership: always a 404, never a 403 — same IDOR-defense convention as the rest of the codebase. */
  async getOwnDocumentContent(tutorId: string, documentId: string): Promise<{ buffer: Buffer; contentType: string }> {
    const document = await this.prisma.client.tutorVerificationDocument.findFirst({
      where: { id: documentId, tutorId },
    });
    if (!document) {
      throw new NotFoundException('Document not found.');
    }
    return this.readDocumentBytes(document);
  }

  /** Admin-only, no ownership restriction beyond the RolesGuard(ADMIN) on the controller route. */
  async getDocumentContentForAdmin(documentId: string): Promise<{ buffer: Buffer; contentType: string }> {
    const document = await this.prisma.client.tutorVerificationDocument.findUnique({
      where: { id: documentId },
    });
    if (!document) {
      throw new NotFoundException('Document not found.');
    }
    return this.readDocumentBytes(document);
  }

  /** Tutor explicitly submits their uploaded documents for admin review — only from PENDING or after a REJECTED resubmission, and only once at least one document exists. */
  async submitForReview(tutorId: string) {
    const profile = await this.prisma.client.tutorProfile.findUnique({ where: { userId: tutorId } });
    if (!profile) {
      throw new NotFoundException('Tutor profile not found.');
    }
    if (profile.verificationStatus !== 'PENDING' && profile.verificationStatus !== 'REJECTED') {
      throw new ConflictException('Verification is already under review or verified.');
    }

    const documentCount = await this.prisma.client.tutorVerificationDocument.count({ where: { tutorId } });
    if (documentCount === 0) {
      throw new BadRequestException('Upload at least one document before submitting for review.');
    }

    return this.prisma.client.tutorProfile.update({
      where: { userId: tutorId },
      data: { verificationStatus: 'UNDER_REVIEW' },
      select: { userId: true, verificationStatus: true },
    });
  }

  /** Admin queue — tutors currently awaiting a decision. */
  async adminListQueue() {
    return this.prisma.client.tutorProfile.findMany({
      where: { verificationStatus: 'UNDER_REVIEW' },
      select: {
        userId: true,
        headline: true,
        verificationStatus: true,
        user: { select: { email: true } },
        _count: { select: { verificationDocuments: true } },
      },
      orderBy: { updatedAt: 'asc' },
    });
  }

  async adminListDocumentsForTutor(tutorId: string) {
    const profile = await this.prisma.client.tutorProfile.findUnique({ where: { userId: tutorId } });
    if (!profile) {
      throw new NotFoundException('Tutor profile not found.');
    }
    return this.listOwnDocuments(tutorId);
  }

  async adminDecide(tutorId: string, dto: AdminVerificationDecisionDto) {
    const profile = await this.prisma.client.tutorProfile.findUnique({ where: { userId: tutorId } });
    if (!profile) {
      throw new NotFoundException('Tutor profile not found.');
    }
    if (profile.verificationStatus !== 'UNDER_REVIEW') {
      throw new ConflictException('Only submissions currently under review can be decided.');
    }

    return this.prisma.client.tutorProfile.update({
      where: { userId: tutorId },
      data: { verificationStatus: dto.status },
      select: { userId: true, verificationStatus: true },
    });
  }

  private async readDocumentBytes(document: {
    storageKey: string;
    contentType: string;
  }): Promise<{ buffer: Buffer; contentType: string }> {
    const buffer = await this.storage.read(document.storageKey);
    if (!buffer) {
      throw new NotFoundException('Document content not found.');
    }
    return { buffer, contentType: document.contentType };
  }

  private async assertTutorProfileExists(tutorId: string): Promise<void> {
    const profile = await this.prisma.client.tutorProfile.findUnique({ where: { userId: tutorId } });
    if (!profile) {
      throw new NotFoundException('Create a tutor profile before uploading verification documents.');
    }
  }
}
