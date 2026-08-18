import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { TutorVerificationService } from '../tutor-verification.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';
import type { LocalDocumentStorageProvider } from '../document-storage.service';

const document = {
  id: 'doc-1',
  tutorId: 'tutor-1',
  label: 'Goethe-Zertifikat C2',
  contentType: 'application/pdf',
  storageKey: 'storage-key-1',
  uploadedAt: new Date(),
};

const profile = {
  userId: 'tutor-1',
  verificationStatus: 'PENDING',
  updatedAt: new Date(),
};

function buildPrismaMock(overrides?: {
  tutorProfile?: Partial<Record<string, jest.Mock>>;
  tutorVerificationDocument?: Partial<Record<string, jest.Mock>>;
}) {
  return {
    client: {
      tutorProfile: {
        findUnique: jest.fn().mockResolvedValue(profile),
        update: jest.fn().mockResolvedValue({ userId: 'tutor-1', verificationStatus: 'UNDER_REVIEW' }),
        findMany: jest.fn().mockResolvedValue([]),
        ...overrides?.tutorProfile,
      },
      tutorVerificationDocument: {
        create: jest.fn().mockResolvedValue(document),
        findMany: jest.fn().mockResolvedValue([document]),
        findFirst: jest.fn().mockResolvedValue(document),
        findUnique: jest.fn().mockResolvedValue(document),
        count: jest.fn().mockResolvedValue(1),
        ...overrides?.tutorVerificationDocument,
      },
    },
  } as unknown as PrismaService;
}

function buildStorageMock(overrides?: Partial<Record<string, jest.Mock>>): LocalDocumentStorageProvider {
  return {
    save: jest.fn().mockResolvedValue({ storageKey: 'storage-key-1' }),
    read: jest.fn().mockResolvedValue(Buffer.from('fake-pdf-bytes')),
    ...overrides,
  } as unknown as LocalDocumentStorageProvider;
}

const validDto = { label: 'Goethe-Zertifikat C2', contentType: 'application/pdf' as const, dataBase64: Buffer.from('hello').toString('base64') };

describe('TutorVerificationService', () => {
  describe('uploadDocument', () => {
    it('requires a tutor profile to exist first', async () => {
      const prisma = buildPrismaMock({ tutorProfile: { findUnique: jest.fn().mockResolvedValue(null) } });
      const storage = buildStorageMock();
      const service = new TutorVerificationService(prisma, storage);

      await expect(service.uploadDocument('tutor-1', validDto)).rejects.toBeInstanceOf(NotFoundException);
      expect(storage.save).not.toHaveBeenCalled();
    });

    it('rejects an empty document', async () => {
      const prisma = buildPrismaMock();
      const storage = buildStorageMock();
      const service = new TutorVerificationService(prisma, storage);

      await expect(
        service.uploadDocument('tutor-1', { ...validDto, dataBase64: Buffer.from('').toString('base64') }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a document over the 5MB limit', async () => {
      const prisma = buildPrismaMock();
      const storage = buildStorageMock();
      const service = new TutorVerificationService(prisma, storage);
      const oversized = Buffer.alloc(5 * 1024 * 1024 + 1).toString('base64');

      await expect(service.uploadDocument('tutor-1', { ...validDto, dataBase64: oversized })).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(storage.save).not.toHaveBeenCalled();
    });

    it('stores the bytes and creates metadata scoped to the calling tutor', async () => {
      const prisma = buildPrismaMock();
      const storage = buildStorageMock();
      const service = new TutorVerificationService(prisma, storage);

      await service.uploadDocument('tutor-1', validDto);

      expect(storage.save).toHaveBeenCalledWith(Buffer.from('hello'));
      expect(prisma.client.tutorVerificationDocument.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tutorId: 'tutor-1', storageKey: 'storage-key-1' }),
        }),
      );
    });
  });

  describe('getOwnDocumentContent', () => {
    it('throws NotFoundException (never Forbidden) for a document belonging to a different tutor', async () => {
      const prisma = buildPrismaMock({
        tutorVerificationDocument: { findFirst: jest.fn().mockResolvedValue(null) },
      });
      const storage = buildStorageMock();
      const service = new TutorVerificationService(prisma, storage);

      await expect(service.getOwnDocumentContent('tutor-2', 'doc-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the bytes and content type for the owning tutor', async () => {
      const prisma = buildPrismaMock();
      const storage = buildStorageMock();
      const service = new TutorVerificationService(prisma, storage);

      const result = await service.getOwnDocumentContent('tutor-1', 'doc-1');

      expect(result.contentType).toBe('application/pdf');
      expect(result.buffer.toString()).toBe('fake-pdf-bytes');
    });

    it('throws NotFoundException when the storage layer has no bytes for the storageKey', async () => {
      const prisma = buildPrismaMock();
      const storage = buildStorageMock({ read: jest.fn().mockResolvedValue(null) });
      const service = new TutorVerificationService(prisma, storage);

      await expect(service.getOwnDocumentContent('tutor-1', 'doc-1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('submitForReview', () => {
    it('requires at least one uploaded document', async () => {
      const prisma = buildPrismaMock({ tutorVerificationDocument: { count: jest.fn().mockResolvedValue(0) } });
      const service = new TutorVerificationService(prisma, buildStorageMock());

      await expect(service.submitForReview('tutor-1')).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.client.tutorProfile.update).not.toHaveBeenCalled();
    });

    it('rejects submitting when already UNDER_REVIEW or VERIFIED', async () => {
      const prisma = buildPrismaMock({
        tutorProfile: { findUnique: jest.fn().mockResolvedValue({ ...profile, verificationStatus: 'UNDER_REVIEW' }) },
      });
      const service = new TutorVerificationService(prisma, buildStorageMock());

      await expect(service.submitForReview('tutor-1')).rejects.toBeInstanceOf(ConflictException);
    });

    it('allows resubmission after a REJECTED decision', async () => {
      const prisma = buildPrismaMock({
        tutorProfile: { findUnique: jest.fn().mockResolvedValue({ ...profile, verificationStatus: 'REJECTED' }) },
      });
      const service = new TutorVerificationService(prisma, buildStorageMock());

      await service.submitForReview('tutor-1');

      expect(prisma.client.tutorProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { verificationStatus: 'UNDER_REVIEW' } }),
      );
    });

    it('moves PENDING to UNDER_REVIEW once documents exist', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorVerificationService(prisma, buildStorageMock());

      await service.submitForReview('tutor-1');

      expect(prisma.client.tutorProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'tutor-1' }, data: { verificationStatus: 'UNDER_REVIEW' } }),
      );
    });
  });

  describe('adminDecide', () => {
    it('rejects deciding a submission that is not UNDER_REVIEW', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorVerificationService(prisma, buildStorageMock());

      await expect(service.adminDecide('tutor-1', { status: 'VERIFIED' })).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.client.tutorProfile.update).not.toHaveBeenCalled();
    });

    it('applies the admin decision to a submission under review', async () => {
      const prisma = buildPrismaMock({
        tutorProfile: { findUnique: jest.fn().mockResolvedValue({ ...profile, verificationStatus: 'UNDER_REVIEW' }) },
      });
      const service = new TutorVerificationService(prisma, buildStorageMock());

      await service.adminDecide('tutor-1', { status: 'VERIFIED' });

      expect(prisma.client.tutorProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { verificationStatus: 'VERIFIED' } }),
      );
    });

    it('throws NotFoundException for a nonexistent tutor', async () => {
      const prisma = buildPrismaMock({ tutorProfile: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = new TutorVerificationService(prisma, buildStorageMock());

      await expect(service.adminDecide('nope', { status: 'REJECTED' })).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getDocumentContentForAdmin', () => {
    it('is not scoped to any particular tutor (role-gated at the controller, not here)', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorVerificationService(prisma, buildStorageMock());

      await service.getDocumentContentForAdmin('doc-1');

      expect(prisma.client.tutorVerificationDocument.findUnique).toHaveBeenCalledWith({ where: { id: 'doc-1' } });
    });

    it('throws NotFoundException for a nonexistent document', async () => {
      const prisma = buildPrismaMock({
        tutorVerificationDocument: { findUnique: jest.fn().mockResolvedValue(null) },
      });
      const service = new TutorVerificationService(prisma, buildStorageMock());

      await expect(service.getDocumentContentForAdmin('nope')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
