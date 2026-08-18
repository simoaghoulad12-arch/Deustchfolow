import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { QueryCareerModulesDto } from './dto/query-career-modules.dto';

/**
 * Career Foundation (spec section 16) — a prepared catalog of topics
 * (CV, Anschreiben, Vorstellungsgespräch, Berufsdeutsch, professionelle
 * E-Mails), not an auto-generated deliverable. No forced AI automation
 * in this phase — a module is a static, admin-authored guide a user
 * reads, not a document the platform writes for them.
 */
@Injectable()
export class CareerService {
  constructor(private readonly prisma: PrismaService) {}

  async listActive(query: QueryCareerModulesDto) {
    return this.prisma.client.careerModule.findMany({
      where: {
        isActive: true,
        ...(query.type ? { type: query.type } : {}),
        ...(query.cefrLevel ? { cefrLevel: query.cefrLevel } : {}),
      },
      orderBy: { title: 'asc' },
    });
  }

  async findOne(moduleId: string) {
    const module = await this.prisma.client.careerModule.findUnique({ where: { id: moduleId } });
    if (!module || !module.isActive) {
      throw new NotFoundException('Career module not found.');
    }
    return module;
  }
}
