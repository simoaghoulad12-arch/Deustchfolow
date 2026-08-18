import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TutorProfilesService } from '../tutor-profiles.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';

const baseProfile = {
  userId: 'tutor-1',
  headline: 'Erfahrene Lehrerin',
  aboutMe: 'Ich unterrichte seit Jahren.',
  languages: ['Deutsch'],
  teachingLevels: ['A1', 'A2'],
  specialties: ['CONVERSATION'],
  yearsExperience: 5,
  timezone: 'Europe/Berlin',
  verificationStatus: 'PENDING',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const profileWithMarketplaceData = {
  ...baseProfile,
  user: { profile: { displayName: 'Maria M.', avatarUrl: null } },
  offerings: [
    {
      id: 'offering-1',
      title: '30 Min. Konversation',
      description: 'Lockeres Gespräch',
      category: 'CONVERSATION',
      durationMinutes: 30,
      priceCents: 2000,
      currency: 'EUR',
      cefrLevels: ['A1'],
    },
  ],
};

function buildPrismaMock(overrides?: {
  tutorProfile?: Partial<Record<string, jest.Mock>>;
  review?: Partial<Record<string, jest.Mock>>;
  booking?: Partial<Record<string, jest.Mock>>;
}) {
  return {
    client: {
      tutorProfile: {
        upsert: jest.fn().mockResolvedValue(baseProfile),
        findUnique: jest.fn().mockResolvedValue(baseProfile),
        findMany: jest.fn().mockResolvedValue([profileWithMarketplaceData]),
        update: jest.fn().mockResolvedValue({ ...baseProfile, isActive: false }),
        ...overrides?.tutorProfile,
      },
      review: {
        groupBy: jest.fn().mockResolvedValue([]),
        ...overrides?.review,
      },
      booking: {
        groupBy: jest.fn().mockResolvedValue([]),
        ...overrides?.booking,
      },
    },
  } as unknown as PrismaService;
}

describe('TutorProfilesService', () => {
  describe('upsertOwnProfile', () => {
    it('rejects an invalid IANA timezone before touching the database', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorProfilesService(prisma);

      await expect(
        service.upsertOwnProfile('tutor-1', { languages: [], timezone: 'Not/A_Zone' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.client.tutorProfile.upsert).not.toHaveBeenCalled();
    });

    it('upserts scoped to the calling user id, never a client-supplied id', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorProfilesService(prisma);

      await service.upsertOwnProfile('tutor-1', { languages: ['Deutsch'], timezone: 'Europe/Berlin' });

      expect(prisma.client.tutorProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'tutor-1' },
          create: expect.objectContaining({ userId: 'tutor-1', timezone: 'Europe/Berlin' }),
        }),
      );
    });

    it('does not leak the private timezone field into the returned view beyond the owner themselves', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorProfilesService(prisma);

      const result = await service.upsertOwnProfile('tutor-1', {
        languages: [],
        timezone: 'Europe/Berlin',
      });

      // This IS the owner's own view — timezone is expected here. The
      // point of this test is documenting that this shape (with
      // timezone/verificationStatus) is distinct from the public
      // marketplace card shape (see toMarketplaceCard tests below).
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('verificationStatus');
    });
  });

  describe('findOwnProfile', () => {
    it('throws NotFoundException when the tutor has not created a profile yet', async () => {
      const prisma = buildPrismaMock({ tutorProfile: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = new TutorProfilesService(prisma);

      await expect(service.findOwnProfile('tutor-1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findMarketplace', () => {
    it('applies level/language/specialty/price filters as a real WHERE clause', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorProfilesService(prisma);

      await service.findMarketplace({
        level: 'A1',
        language: 'Deutsch',
        specialty: 'CONVERSATION',
        maxPriceCents: 3000,
      });

      const call = (prisma.client.tutorProfile.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where).toEqual(
        expect.objectContaining({
          isActive: true,
          teachingLevels: { has: 'A1' },
          languages: { has: 'Deutsch' },
          specialties: { has: 'CONVERSATION' },
          offerings: { some: { isActive: true, priceCents: { lte: 3000 } } },
        }),
      );
    });

    it('excludes soft-deleted tutors from the marketplace WHERE clause (Phase 6.5: account deletion must be a real erasure from public view)', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorProfilesService(prisma);

      await service.findMarketplace({});

      const call = (prisma.client.tutorProfile.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where).toEqual(expect.objectContaining({ user: { deletedAt: null } }));
    });

    it('computes averageRating and completedSessions from real aggregates, never inventing a number', async () => {
      const prisma = buildPrismaMock({
        review: {
          groupBy: jest
            .fn()
            .mockResolvedValue([{ tutorId: 'tutor-1', _avg: { rating: 4.5 }, _count: { rating: 2 } }]),
        },
        booking: {
          groupBy: jest.fn().mockResolvedValue([{ tutorId: 'tutor-1', _count: { id: 7 } }]),
        },
      });
      const service = new TutorProfilesService(prisma);

      const results = await service.findMarketplace({});

      expect(results[0]).toMatchObject({ averageRating: 4.5, reviewCount: 2, completedSessions: 7 });
    });

    it('reports no rating rather than a fabricated 0 when a tutor has no reviews yet', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorProfilesService(prisma);

      const results = await service.findMarketplace({});

      expect(results[0]!.averageRating).toBeNull();
      expect(results[0]!.reviewCount).toBe(0);
    });

    it('filters by minRating in application code after fetching', async () => {
      const prisma = buildPrismaMock({
        review: {
          groupBy: jest
            .fn()
            .mockResolvedValue([{ tutorId: 'tutor-1', _avg: { rating: 2 }, _count: { rating: 1 } }]),
        },
      });
      const service = new TutorProfilesService(prisma);

      const results = await service.findMarketplace({ minRating: 4 });

      expect(results).toHaveLength(0);
    });

    it('never presents verificationStatus as anything other than what the tutor actually has', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorProfilesService(prisma);

      const results = await service.findMarketplace({});

      expect(results[0]!.verificationStatus).toBe('PENDING');
    });
  });

  describe('findPublicProfile', () => {
    it('throws NotFoundException for a nonexistent tutor', async () => {
      const prisma = buildPrismaMock({ tutorProfile: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = new TutorProfilesService(prisma);

      await expect(service.findPublicProfile('nope')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException for a deactivated tutor (admin-deactivated tutors disappear from public view)', async () => {
      const prisma = buildPrismaMock({
        tutorProfile: {
          findUnique: jest.fn().mockResolvedValue({ ...profileWithMarketplaceData, isActive: false }),
        },
      });
      const service = new TutorProfilesService(prisma);

      await expect(service.findPublicProfile('tutor-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFoundException for a soft-deleted tutor (account deletion is a real erasure from public view, not just an access cutoff)', async () => {
      const prisma = buildPrismaMock({
        tutorProfile: {
          findUnique: jest.fn().mockResolvedValue({
            ...profileWithMarketplaceData,
            user: { ...profileWithMarketplaceData.user, deletedAt: new Date('2026-01-01') },
          }),
        },
      });
      const service = new TutorProfilesService(prisma);

      await expect(service.findPublicProfile('tutor-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('never exposes the tutor\'s private timezone in the public view', async () => {
      const prisma = buildPrismaMock({
        tutorProfile: { findUnique: jest.fn().mockResolvedValue(profileWithMarketplaceData) },
      });
      const service = new TutorProfilesService(prisma);

      const result = await service.findPublicProfile('tutor-1');

      expect(result).not.toHaveProperty('timezone');
    });
  });

  describe('adminSetActive', () => {
    it('throws NotFoundException for a nonexistent tutor profile', async () => {
      const prisma = buildPrismaMock({ tutorProfile: { findUnique: jest.fn().mockResolvedValue(null) } });
      const service = new TutorProfilesService(prisma);

      await expect(service.adminSetActive('nope', false)).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.client.tutorProfile.update).not.toHaveBeenCalled();
    });

    it('updates isActive scoped to the given tutorId, never deleting the profile', async () => {
      const prisma = buildPrismaMock();
      const service = new TutorProfilesService(prisma);

      await service.adminSetActive('tutor-1', false);

      expect(prisma.client.tutorProfile.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'tutor-1' }, data: { isActive: false } }),
      );
    });
  });
});
