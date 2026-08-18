import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { CreateDocumentRequirementDto } from '../dto/create-document-requirement.dto';
import type { UpdateDocumentRequirementDto } from '../dto/update-document-requirement.dto';

@Injectable()
export class DocumentChecklistService {
  constructor(private readonly prisma: PrismaService) {}

  async listOwn(userId: string) {
    return this.prisma.client.documentRequirement.findMany({
      where: { userId },
      include: { source: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(userId: string, dto: CreateDocumentRequirementDto) {
    return this.prisma.client.documentRequirement.create({
      data: {
        userId,
        documentType: dto.documentType,
        goal: dto.goal,
        context: dto.context,
        sourceId: dto.sourceId,
        notes: dto.notes,
      },
      include: { source: true },
    });
  }

  /** Ownership: always a 404, never a 403 — same IDOR-defense convention as the rest of the codebase. */
  async update(userId: string, requirementId: string, dto: UpdateDocumentRequirementDto) {
    await this.assertOwned(userId, requirementId);
    return this.prisma.client.documentRequirement.update({
      where: { id: requirementId },
      data: dto,
      include: { source: true },
    });
  }

  async remove(userId: string, requirementId: string): Promise<void> {
    await this.assertOwned(userId, requirementId);
    await this.prisma.client.documentRequirement.delete({ where: { id: requirementId } });
  }

  private async assertOwned(userId: string, requirementId: string): Promise<void> {
    const requirement = await this.prisma.client.documentRequirement.findFirst({
      where: { id: requirementId, userId },
    });
    if (!requirement) {
      throw new NotFoundException('Document requirement not found.');
    }
  }
}
