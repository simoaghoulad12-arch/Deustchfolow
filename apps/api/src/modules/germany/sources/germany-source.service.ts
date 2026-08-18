import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { CreateOfficialSourceDto } from '../dto/create-official-source.dto';
import type { UpdateOfficialSourceDto } from '../dto/update-official-source.dto';
import type { QueryOfficialSourcesDto } from '../dto/query-official-sources.dto';

/**
 * The architecture for trustworthy Germany-relevant facts, not the facts
 * themselves (spec section 13). Every row here is curated by DeutschFlow
 * staff (admin-only writes) — never generated or inferred, so nothing in
 * this service invents legal/official information.
 */
@Injectable()
export class GermanySourceService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public — only active sources, never drafts/retired ones. */
  async listActive(query: QueryOfficialSourcesDto) {
    return this.prisma.client.officialSource.findMany({
      where: {
        active: true,
        ...(query.topic ? { topic: query.topic } : {}),
        ...(query.language ? { language: query.language } : {}),
      },
      orderBy: { title: 'asc' },
    });
  }

  async adminCreate(dto: CreateOfficialSourceDto) {
    return this.prisma.client.officialSource.create({
      data: {
        title: dto.title,
        url: dto.url,
        authority: dto.authority,
        topic: dto.topic,
        language: dto.language,
        lastVerifiedAt: dto.lastVerifiedAt ? new Date(dto.lastVerifiedAt) : undefined,
      },
    });
  }

  async adminUpdate(sourceId: string, dto: UpdateOfficialSourceDto) {
    const source = await this.prisma.client.officialSource.findUnique({ where: { id: sourceId } });
    if (!source) {
      throw new NotFoundException('Official source not found.');
    }
    return this.prisma.client.officialSource.update({
      where: { id: sourceId },
      data: {
        ...dto,
        lastVerifiedAt: dto.lastVerifiedAt ? new Date(dto.lastVerifiedAt) : undefined,
      },
    });
  }
}
