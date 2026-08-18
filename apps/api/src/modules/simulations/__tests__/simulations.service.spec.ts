import { NotFoundException } from '@nestjs/common';
import { SimulationsService } from '../simulations.service';
import type { PrismaService } from '../../../common/prisma/prisma.service';

const simulation = {
  id: 'sim-1',
  title: 'Arzttermin vereinbaren',
  category: 'DOCTOR',
  cefrLevel: 'A2',
  situation: 'Du möchtest einen Arzttermin telefonisch vereinbaren.',
  goal: 'Einen passenden Termin finden.',
  roles: ['Arzthelferin'],
  expectedSkills: ['SPEAKING'],
  isActive: true,
};

function buildPrismaMock(overrides?: { simulation?: Partial<Record<string, jest.Mock>> }) {
  return {
    client: {
      simulation: {
        findMany: jest.fn().mockResolvedValue([simulation]),
        findUnique: jest.fn().mockResolvedValue(simulation),
        ...overrides?.simulation,
      },
    },
  } as unknown as PrismaService;
}

describe('SimulationsService', () => {
  describe('listActive', () => {
    it('always filters to active simulations', async () => {
      const prisma = buildPrismaMock();
      const service = new SimulationsService(prisma);

      await service.listActive({});

      expect(prisma.client.simulation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: true } }),
      );
    });

    it('applies category and cefrLevel filters when provided', async () => {
      const prisma = buildPrismaMock();
      const service = new SimulationsService(prisma);

      await service.listActive({ category: 'DOCTOR' as never, cefrLevel: 'A2' as never });

      expect(prisma.client.simulation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: true, category: 'DOCTOR', cefrLevel: 'A2' } }),
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException for a nonexistent simulation', async () => {
      const prisma = buildPrismaMock({ simulation: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = new SimulationsService(prisma);

      await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException for a deactivated simulation', async () => {
      const prisma = buildPrismaMock({
        simulation: { findUnique: jest.fn().mockResolvedValue({ ...simulation, isActive: false }) },
      });
      const service = new SimulationsService(prisma);

      await expect(service.findOne('sim-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the simulation for a valid, active id', async () => {
      const prisma = buildPrismaMock();
      const service = new SimulationsService(prisma);

      const result = await service.findOne('sim-1');

      expect(result).toEqual(simulation);
    });
  });
});
