import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { CreateOfferingDto } from '../dto/create-offering.dto';
import type { UpdateOfferingDto } from '../dto/update-offering.dto';

/**
 * Offerings are never hard-deleted — Booking references offeringId with
 * onDelete: Restrict (a booking must always be able to show what it was
 * for, even years later), and a tutor "removing" an offering really
 * means "stop taking new bookings for it". Deactivation (isActive:
 * false, via update) is the only removal path exposed.
 */
@Injectable()
export class OfferingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tutorId: string, dto: CreateOfferingDto) {
    await this.assertTutorProfileExists(tutorId);

    return this.prisma.client.offering.create({
      data: {
        tutorId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        durationMinutes: dto.durationMinutes,
        priceCents: dto.priceCents,
        cefrLevels: dto.cefrLevels ?? [],
      },
    });
  }

  async update(tutorId: string, offeringId: string, dto: UpdateOfferingDto) {
    await this.assertOwnedByTutor(tutorId, offeringId);

    return this.prisma.client.offering.update({
      where: { id: offeringId },
      data: dto,
    });
  }

  async findOwn(tutorId: string) {
    return this.prisma.client.offering.findMany({
      where: { tutorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveForTutor(tutorId: string) {
    return this.prisma.client.offering.findMany({
      where: { tutorId, isActive: true },
      orderBy: { priceCents: 'asc' },
    });
  }

  private async assertTutorProfileExists(tutorId: string): Promise<void> {
    const profile = await this.prisma.client.tutorProfile.findUnique({ where: { userId: tutorId } });
    if (!profile) {
      throw new NotFoundException('Create a tutor profile before adding offerings.');
    }
  }

  /** Ownership: always a 404, never a 403, for another tutor's offering — this avoids confirming that the id even exists, same IDOR-defense convention as TutorService.getOwnedSession in the AI module. */
  private async assertOwnedByTutor(tutorId: string, offeringId: string): Promise<void> {
    const offering = await this.prisma.client.offering.findFirst({
      where: { id: offeringId, tutorId },
    });
    if (!offering) {
      throw new NotFoundException('Offering not found.');
    }
  }
}
