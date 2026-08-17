import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IANAZone } from 'luxon';
import { Prisma } from '@deutschflow/database';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { UpsertTutorProfileDto } from '../dto/upsert-tutor-profile.dto';
import type { QueryTutorsDto } from '../dto/query-tutors.dto';

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

const MARKETPLACE_INCLUDE = {
  user: { include: { profile: true } },
  offerings: { where: { isActive: true }, orderBy: { priceCents: 'asc' } },
} satisfies Prisma.TutorProfileInclude;

type TutorProfileWithMarketplaceData = Prisma.TutorProfileGetPayload<{
  include: typeof MARKETPLACE_INCLUDE;
}>;

interface RatingSummary {
  averageRating: number | null;
  reviewCount: number;
  completedSessions: number;
}

/**
 * Owns the marketplace-facing tutor identity. `averageRating` and
 * `completedSessions` are deliberately computed on read from Review/
 * Booking rather than denormalized onto TutorProfile — a stale cached
 * number here would be a trust problem for a marketplace, and the
 * aggregate queries are cheap at this scale (see architecture decision
 * record for the tradeoff at larger scale).
 */
@Injectable()
export class TutorProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertOwnProfile(userId: string, dto: UpsertTutorProfileDto) {
    if (!IANAZone.isValidZone(dto.timezone)) {
      throw new BadRequestException(`"${dto.timezone}" is not a valid IANA timezone.`);
    }

    const data = {
      headline: dto.headline,
      aboutMe: dto.aboutMe,
      languages: dto.languages ?? [],
      teachingLevels: dto.teachingLevels ?? [],
      specialties: dto.specialties ?? [],
      yearsExperience: dto.yearsExperience,
      timezone: dto.timezone,
    };

    const profile = await this.prisma.client.tutorProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });

    return this.toOwnProfileView(profile);
  }

  async findOwnProfile(userId: string) {
    const profile = await this.prisma.client.tutorProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Tutor profile not found — create one first.');
    }
    return this.toOwnProfileView(profile);
  }

  /**
   * Public marketplace listing. Structured filters (level/language/
   * specialty/price) run as a real WHERE clause; the rating filter is
   * applied after fetching (see architecture decision record — avoids a
   * raw-SQL aggregate-having query for what is, at this stage, a
   * dev-scale marketplace; revisit if the tutor count grows large).
   */
  async findMarketplace(query: QueryTutorsDto) {
    const where: Prisma.TutorProfileWhereInput = {
      isActive: true,
      ...(query.level ? { teachingLevels: { has: query.level } } : {}),
      ...(query.language ? { languages: { has: query.language } } : {}),
      ...(query.specialty ? { specialties: { has: query.specialty } } : {}),
      ...(query.maxPriceCents !== undefined
        ? { offerings: { some: { isActive: true, priceCents: { lte: query.maxPriceCents } } } }
        : {}),
    };

    const take = Math.min(query.take ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const skip = query.skip ?? 0;

    const profiles = await this.prisma.client.tutorProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      // Overfetch a bit before the in-memory rating filter so pagination
      // still returns `take` results in the common case without rating
      // filtering; a simple, honest tradeoff at this scale.
      skip,
      take: query.minRating !== undefined ? take * 3 : take,
      include: MARKETPLACE_INCLUDE,
    });

    const summaries = await this.ratingSummariesFor(profiles.map((p) => p.userId));

    let results = profiles.map((profile) => this.toMarketplaceCard(profile, summaries.get(profile.userId)));

    if (query.minRating !== undefined) {
      const minRating = query.minRating;
      results = results.filter((r) => (r.averageRating ?? 0) >= minRating).slice(0, take);
    }

    return results;
  }

  async findPublicProfile(tutorId: string) {
    const profile = await this.prisma.client.tutorProfile.findUnique({
      where: { userId: tutorId },
      include: MARKETPLACE_INCLUDE,
    });

    if (!profile || !profile.isActive) {
      throw new NotFoundException('Tutor not found.');
    }

    const summary = (await this.ratingSummariesFor([tutorId])).get(tutorId);

    return this.toPublicProfileView(profile, summary);
  }

  private async ratingSummariesFor(tutorIds: string[]): Promise<Map<string, RatingSummary>> {
    if (tutorIds.length === 0) return new Map();

    const [ratingRows, completedRows] = await Promise.all([
      this.prisma.client.review.groupBy({
        by: ['tutorId'],
        where: { tutorId: { in: tutorIds }, isHidden: false },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      this.prisma.client.booking.groupBy({
        by: ['tutorId'],
        where: { tutorId: { in: tutorIds }, status: 'COMPLETED' },
        _count: { id: true },
      }),
    ]);

    const summaries = new Map<string, RatingSummary>();
    for (const tutorId of tutorIds) {
      const ratingRow = ratingRows.find((r) => r.tutorId === tutorId);
      const completedRow = completedRows.find((r) => r.tutorId === tutorId);
      summaries.set(tutorId, {
        averageRating: ratingRow?._avg.rating ?? null,
        reviewCount: ratingRow?._count.rating ?? 0,
        completedSessions: completedRow?._count.id ?? 0,
      });
    }
    return summaries;
  }

  private toOwnProfileView(profile: Prisma.TutorProfileGetPayload<Record<string, never>>) {
    return {
      userId: profile.userId,
      headline: profile.headline,
      aboutMe: profile.aboutMe,
      languages: profile.languages,
      teachingLevels: profile.teachingLevels,
      specialties: profile.specialties,
      yearsExperience: profile.yearsExperience,
      timezone: profile.timezone,
      verificationStatus: profile.verificationStatus,
      isActive: profile.isActive,
    };
  }

  /**
   * Every field below is either tutor-provided (never presented by us as
   * a verified claim — the client is responsible for labeling e.g.
   * `verificationStatus !== 'VERIFIED'` accordingly) or computed from
   * real completed activity (rating, completedSessions). Nothing here is
   * invented (spec section 2).
   */
  private toMarketplaceCard(profile: TutorProfileWithMarketplaceData, summary?: RatingSummary) {
    return {
      userId: profile.userId,
      displayName: profile.user.profile?.displayName ?? null,
      avatarUrl: profile.user.profile?.avatarUrl ?? null,
      headline: profile.headline,
      languages: profile.languages,
      teachingLevels: profile.teachingLevels,
      specialties: profile.specialties,
      verificationStatus: profile.verificationStatus,
      averageRating: summary?.averageRating ?? null,
      reviewCount: summary?.reviewCount ?? 0,
      completedSessions: summary?.completedSessions ?? 0,
      offerings: profile.offerings.map((o) => ({
        id: o.id,
        title: o.title,
        category: o.category,
        durationMinutes: o.durationMinutes,
        priceCents: o.priceCents,
        currency: o.currency,
      })),
    };
  }

  private toPublicProfileView(profile: TutorProfileWithMarketplaceData, summary?: RatingSummary) {
    return {
      userId: profile.userId,
      displayName: profile.user.profile?.displayName ?? null,
      avatarUrl: profile.user.profile?.avatarUrl ?? null,
      headline: profile.headline,
      aboutMe: profile.aboutMe,
      languages: profile.languages,
      teachingLevels: profile.teachingLevels,
      specialties: profile.specialties,
      yearsExperience: profile.yearsExperience,
      verificationStatus: profile.verificationStatus,
      averageRating: summary?.averageRating ?? null,
      reviewCount: summary?.reviewCount ?? 0,
      completedSessions: summary?.completedSessions ?? 0,
      offerings: profile.offerings.map((o) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        category: o.category,
        durationMinutes: o.durationMinutes,
        priceCents: o.priceCents,
        currency: o.currency,
        cefrLevels: o.cefrLevels,
      })),
    };
  }
}
