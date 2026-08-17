import { NotFoundException } from '@nestjs/common';
import { LevelsService } from '../levels/levels.service';
import type { PrismaService } from '../../../common/prisma/prisma.service';

function buildPrismaMock(level: unknown) {
  return {
    client: {
      level: {
        findMany: jest.fn().mockResolvedValue([level]),
        findUnique: jest.fn().mockResolvedValue(level),
      },
    },
  } as unknown as PrismaService;
}

describe('LevelsService', () => {
  it('loads the list of levels', async () => {
    const prisma = buildPrismaMock({ id: '1', code: 'A1', name: 'A1', order: 1 });
    const service = new LevelsService(prisma);

    const levels = await service.findAll();

    expect(levels).toHaveLength(1);
    expect(prisma.client.level.findMany).toHaveBeenCalledTimes(1);
  });

  it('loads a single level with its courses', async () => {
    const prisma = buildPrismaMock({ id: '1', code: 'A1', name: 'A1', order: 1, courses: [] });
    const service = new LevelsService(prisma);

    const level = await service.findByCode('A1');

    expect(level.code).toBe('A1');
  });

  it('rejects an unknown CEFR code before ever querying the database', async () => {
    const prisma = buildPrismaMock(null);
    const service = new LevelsService(prisma);

    await expect(service.findByCode('Z9')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.client.level.findUnique).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the level does not exist', async () => {
    const prisma = buildPrismaMock(null);
    const service = new LevelsService(prisma);

    await expect(service.findByCode('A1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
