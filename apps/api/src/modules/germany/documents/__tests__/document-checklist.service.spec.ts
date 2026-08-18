import { NotFoundException } from '@nestjs/common';
import { DocumentChecklistService } from '../document-checklist.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';

const requirement = {
  id: 'req-1',
  userId: 'user-1',
  documentType: 'Reisepass',
  goal: 'WORK',
  context: null,
  status: 'MISSING',
  sourceId: null,
  notes: null,
};

function buildPrismaMock(overrides?: { documentRequirement?: Partial<Record<string, jest.Mock>> }) {
  return {
    client: {
      documentRequirement: {
        findMany: jest.fn().mockResolvedValue([requirement]),
        findFirst: jest.fn().mockResolvedValue(requirement),
        create: jest.fn().mockResolvedValue(requirement),
        update: jest.fn().mockResolvedValue(requirement),
        delete: jest.fn().mockResolvedValue(requirement),
        ...overrides?.documentRequirement,
      },
    },
  } as unknown as PrismaService;
}

describe('DocumentChecklistService', () => {
  describe('listOwn', () => {
    it('scopes the query to the calling user', async () => {
      const prisma = buildPrismaMock();
      const service = new DocumentChecklistService(prisma);

      await service.listOwn('user-1');

      expect(prisma.client.documentRequirement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  describe('create', () => {
    it('creates the requirement scoped to the calling user', async () => {
      const prisma = buildPrismaMock();
      const service = new DocumentChecklistService(prisma);

      await service.create('user-1', { documentType: 'Reisepass', goal: 'WORK' as never });

      expect(prisma.client.documentRequirement.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: 'user-1', documentType: 'Reisepass' }) }),
      );
    });
  });

  describe('update', () => {
    it('throws NotFoundException (never Forbidden) for a requirement belonging to a different user', async () => {
      const prisma = buildPrismaMock({
        documentRequirement: { findFirst: jest.fn().mockResolvedValue(null) },
      });
      const service = new DocumentChecklistService(prisma);

      await expect(service.update('user-2', 'req-1', { status: 'UPLOADED' as never })).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.client.documentRequirement.update).not.toHaveBeenCalled();
    });

    it('scopes the ownership lookup to (id, userId) together', async () => {
      const prisma = buildPrismaMock();
      const service = new DocumentChecklistService(prisma);

      await service.update('user-1', 'req-1', { status: 'UPLOADED' as never });

      expect(prisma.client.documentRequirement.findFirst).toHaveBeenCalledWith({
        where: { id: 'req-1', userId: 'user-1' },
      });
    });
  });

  describe('remove', () => {
    it('throws NotFoundException for a requirement belonging to a different user', async () => {
      const prisma = buildPrismaMock({
        documentRequirement: { findFirst: jest.fn().mockResolvedValue(null) },
      });
      const service = new DocumentChecklistService(prisma);

      await expect(service.remove('user-2', 'req-1')).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.client.documentRequirement.delete).not.toHaveBeenCalled();
    });

    it('deletes the requirement once ownership is confirmed', async () => {
      const prisma = buildPrismaMock();
      const service = new DocumentChecklistService(prisma);

      await service.remove('user-1', 'req-1');

      expect(prisma.client.documentRequirement.delete).toHaveBeenCalledWith({ where: { id: 'req-1' } });
    });
  });
});
