import { NotFoundException } from '@nestjs/common';
import { GermanyPathService } from '../germany-path.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';

const path = {
  userId: 'user-1',
  goalType: 'WORK',
  currentStep: 'QUALIFICATION_CHECK',
  createdAt: new Date(),
  updatedAt: new Date(),
};

function buildPrismaMock(overrides?: { germanyPath?: Partial<Record<string, jest.Mock>> }) {
  return {
    client: {
      germanyPath: {
        upsert: jest.fn().mockResolvedValue(path),
        findUnique: jest.fn().mockResolvedValue(path),
        update: jest.fn().mockResolvedValue({ ...path, currentStep: 'DOCUMENTS' }),
        ...overrides?.germanyPath,
      },
    },
  } as unknown as PrismaService;
}

describe('GermanyPathService', () => {
  describe('setGoal', () => {
    it('upserts scoped to the calling user, creating with ORIENTATION default and never resetting an existing path on update', async () => {
      const prisma = buildPrismaMock();
      const service = new GermanyPathService(prisma);

      await service.setGoal('user-1', { goalType: 'WORK' as never });

      expect(prisma.client.germanyPath.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        create: { userId: 'user-1', goalType: 'WORK' },
        update: { goalType: 'WORK' },
      });
    });
  });

  describe('setStep', () => {
    it('throws NotFoundException when no path exists yet (goal not set)', async () => {
      const prisma = buildPrismaMock({ germanyPath: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = new GermanyPathService(prisma);

      await expect(service.setStep('user-1', { step: 'DOCUMENTS' as never })).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.client.germanyPath.update).not.toHaveBeenCalled();
    });

    it('updates the step scoped to the calling user', async () => {
      const prisma = buildPrismaMock();
      const service = new GermanyPathService(prisma);

      await service.setStep('user-1', { step: 'DOCUMENTS' as never });

      expect(prisma.client.germanyPath.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { currentStep: 'DOCUMENTS' },
      });
    });
  });

  describe('getOwnPath', () => {
    it('returns null when the user has not set a goal yet', async () => {
      const prisma = buildPrismaMock({ germanyPath: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = new GermanyPathService(prisma);

      const result = await service.getOwnPath('user-1');

      expect(result).toBeNull();
    });

    it('marks every step before currentStep as DONE and every step after as UPCOMING', async () => {
      const prisma = buildPrismaMock();
      const service = new GermanyPathService(prisma);

      const result = await service.getOwnPath('user-1');

      expect(result?.steps.find((s) => s.step === 'ORIENTATION')?.status).toBe('DONE');
      expect(result?.steps.find((s) => s.step === 'GERMAN_LEVEL')?.status).toBe('DONE');
      expect(result?.steps.find((s) => s.step === 'QUALIFICATION_CHECK')?.status).toBe('CURRENT');
      expect(result?.steps.find((s) => s.step === 'JOB_OR_APPRENTICESHIP')?.status).toBe('UPCOMING');
    });

    it('computes nextStep as the step right after currentStep', async () => {
      const prisma = buildPrismaMock();
      const service = new GermanyPathService(prisma);

      const result = await service.getOwnPath('user-1');

      expect(result?.nextStep).toBe('JOB_OR_APPRENTICESHIP');
    });

    it('returns nextStep null when already at the last step', async () => {
      const prisma = buildPrismaMock({
        germanyPath: {
          findUnique: jest.fn().mockResolvedValue({ ...path, currentStep: 'GERMANY_EVERYDAY_LIFE' }),
        },
      });
      const service = new GermanyPathService(prisma);

      const result = await service.getOwnPath('user-1');

      expect(result?.nextStep).toBeNull();
    });
  });
});
