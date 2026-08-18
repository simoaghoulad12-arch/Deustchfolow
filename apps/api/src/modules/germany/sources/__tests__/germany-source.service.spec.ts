import { NotFoundException } from '@nestjs/common';
import { GermanySourceService } from '../germany-source.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';

const source = {
  id: 'source-1',
  title: 'Make it in Germany',
  url: 'https://www.make-it-in-germany.com',
  authority: 'Bundesagentur für Arbeit',
  topic: 'JOB_SEARCH',
  language: 'de',
  lastVerifiedAt: null,
  active: true,
};

function buildPrismaMock(overrides?: { officialSource?: Partial<Record<string, jest.Mock>> }) {
  return {
    client: {
      officialSource: {
        findMany: jest.fn().mockResolvedValue([source]),
        findUnique: jest.fn().mockResolvedValue(source),
        create: jest.fn().mockResolvedValue(source),
        update: jest.fn().mockResolvedValue(source),
        ...overrides?.officialSource,
      },
    },
  } as unknown as PrismaService;
}

describe('GermanySourceService', () => {
  describe('listActive', () => {
    it('always filters to active sources, even with no other filters', async () => {
      const prisma = buildPrismaMock();
      const service = new GermanySourceService(prisma);

      await service.listActive({});

      expect(prisma.client.officialSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { active: true } }),
      );
    });

    it('applies topic and language filters when provided', async () => {
      const prisma = buildPrismaMock();
      const service = new GermanySourceService(prisma);

      await service.listActive({ topic: 'JOB_SEARCH' as never, language: 'de' });

      expect(prisma.client.officialSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { active: true, topic: 'JOB_SEARCH', language: 'de' } }),
      );
    });
  });

  describe('adminCreate', () => {
    it('creates a source with the given fields', async () => {
      const prisma = buildPrismaMock();
      const service = new GermanySourceService(prisma);

      await service.adminCreate({
        title: 'Make it in Germany',
        url: 'https://www.make-it-in-germany.com',
        authority: 'Bundesagentur für Arbeit',
        topic: 'JOB_SEARCH' as never,
        language: 'de',
      });

      expect(prisma.client.officialSource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ title: 'Make it in Germany', topic: 'JOB_SEARCH' }),
        }),
      );
    });
  });

  describe('adminUpdate', () => {
    it('throws NotFoundException for a nonexistent source', async () => {
      const prisma = buildPrismaMock({ officialSource: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = new GermanySourceService(prisma);

      await expect(service.adminUpdate('nope', { active: false })).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.client.officialSource.update).not.toHaveBeenCalled();
    });

    it('can deactivate a source (moderation without deleting history)', async () => {
      const prisma = buildPrismaMock();
      const service = new GermanySourceService(prisma);

      await service.adminUpdate('source-1', { active: false });

      expect(prisma.client.officialSource.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'source-1' }, data: expect.objectContaining({ active: false }) }),
      );
    });
  });
});
