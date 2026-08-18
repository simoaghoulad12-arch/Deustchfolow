import { NotFoundException } from '@nestjs/common';
import { CareerService } from '../career.service';
import type { PrismaService } from '../../../common/prisma/prisma.service';

const careerModule = {
  id: 'module-1',
  type: 'CV',
  title: 'Lebenslauf auf Deutsch',
  description: 'Aufbau und Formulierungen für einen deutschen Lebenslauf.',
  cefrLevel: 'B1',
  isActive: true,
};

function buildPrismaMock(overrides?: { careerModule?: Partial<Record<string, jest.Mock>> }) {
  return {
    client: {
      careerModule: {
        findMany: jest.fn().mockResolvedValue([careerModule]),
        findUnique: jest.fn().mockResolvedValue(careerModule),
        ...overrides?.careerModule,
      },
    },
  } as unknown as PrismaService;
}

describe('CareerService', () => {
  describe('listActive', () => {
    it('always filters to active modules', async () => {
      const prisma = buildPrismaMock();
      const service = new CareerService(prisma);

      await service.listActive({});

      expect(prisma.client.careerModule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: true } }),
      );
    });

    it('applies type and cefrLevel filters when provided', async () => {
      const prisma = buildPrismaMock();
      const service = new CareerService(prisma);

      await service.listActive({ type: 'CV' as never, cefrLevel: 'B1' as never });

      expect(prisma.client.careerModule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: true, type: 'CV', cefrLevel: 'B1' } }),
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException for a nonexistent module', async () => {
      const prisma = buildPrismaMock({ careerModule: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = new CareerService(prisma);

      await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException for a deactivated module', async () => {
      const prisma = buildPrismaMock({
        careerModule: { findUnique: jest.fn().mockResolvedValue({ ...careerModule, isActive: false }) },
      });
      const service = new CareerService(prisma);

      await expect(service.findOne('module-1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
