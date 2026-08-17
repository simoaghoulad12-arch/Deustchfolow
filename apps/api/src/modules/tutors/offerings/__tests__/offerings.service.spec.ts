import { NotFoundException } from '@nestjs/common';
import { OfferingsService } from '../offerings.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';

const offering = {
  id: 'offering-1',
  tutorId: 'tutor-1',
  title: '30 Min. Konversation',
  description: null,
  category: 'CONVERSATION',
  durationMinutes: 30,
  priceCents: 2000,
  currency: 'EUR',
  cefrLevels: [],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function buildPrismaMock(overrides?: {
  tutorProfile?: Partial<Record<string, jest.Mock>>;
  offering?: Partial<Record<string, jest.Mock>>;
}) {
  return {
    client: {
      tutorProfile: {
        findUnique: jest.fn().mockResolvedValue({ userId: 'tutor-1' }),
        ...overrides?.tutorProfile,
      },
      offering: {
        create: jest.fn().mockResolvedValue(offering),
        update: jest.fn().mockResolvedValue(offering),
        findFirst: jest.fn().mockResolvedValue(offering),
        findMany: jest.fn().mockResolvedValue([offering]),
        ...overrides?.offering,
      },
    },
  } as unknown as PrismaService;
}

describe('OfferingsService', () => {
  describe('create', () => {
    it('requires a tutor profile to exist first', async () => {
      const prisma = buildPrismaMock({ tutorProfile: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = new OfferingsService(prisma);

      await expect(
        service.create('tutor-1', {
          title: 'x',
          category: 'CONVERSATION' as never,
          durationMinutes: 30,
          priceCents: 1000,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.client.offering.create).not.toHaveBeenCalled();
    });

    it('creates the offering scoped to the calling tutor id', async () => {
      const prisma = buildPrismaMock();
      const service = new OfferingsService(prisma);

      await service.create('tutor-1', {
        title: '30 Min. Konversation',
        category: 'CONVERSATION' as never,
        durationMinutes: 30,
        priceCents: 2000,
      });

      expect(prisma.client.offering.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ tutorId: 'tutor-1' }) }),
      );
    });
  });

  describe('update', () => {
    it('throws NotFoundException (never Forbidden) when the offering belongs to a different tutor — same IDOR-defense convention as the rest of the codebase', async () => {
      const prisma = buildPrismaMock({ offering: { findFirst: jest.fn().mockResolvedValue(null) } });
      const service = new OfferingsService(prisma);

      await expect(service.update('tutor-2', 'offering-1', { title: 'Hacked' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.client.offering.update).not.toHaveBeenCalled();
    });

    it('scopes the ownership lookup to (id, tutorId) together, not id alone', async () => {
      const prisma = buildPrismaMock();
      const service = new OfferingsService(prisma);

      await service.update('tutor-1', 'offering-1', { title: 'Updated' });

      expect(prisma.client.offering.findFirst).toHaveBeenCalledWith({
        where: { id: 'offering-1', tutorId: 'tutor-1' },
      });
      expect(prisma.client.offering.update).toHaveBeenCalledWith({
        where: { id: 'offering-1' },
        data: { title: 'Updated' },
      });
    });

    it('deactivating is a normal update, never a hard delete (Booking references offeringId with onDelete: Restrict)', async () => {
      const prisma = buildPrismaMock();
      const service = new OfferingsService(prisma);

      await service.update('tutor-1', 'offering-1', { isActive: false });

      expect(prisma.client.offering.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isActive: false } }),
      );
    });
  });

  describe('findActiveForTutor', () => {
    it('only returns active offerings for public/marketplace consumption', async () => {
      const prisma = buildPrismaMock();
      const service = new OfferingsService(prisma);

      await service.findActiveForTutor('tutor-1');

      expect(prisma.client.offering.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tutorId: 'tutor-1', isActive: true } }),
      );
    });
  });
});
