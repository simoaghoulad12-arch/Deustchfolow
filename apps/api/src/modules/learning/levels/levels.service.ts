import { Injectable, NotFoundException } from '@nestjs/common';
import { CEFRLevel } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class LevelsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.level.findMany({
      orderBy: { order: 'asc' },
      select: { id: true, code: true, name: true, description: true, order: true },
    });
  }

  /**
   * One query with a nested `select` — Prisma compiles this to a single
   * join, not N+1 (see architecture note in courses.service.ts for the
   * same pattern).
   */
  async findByCode(code: string) {
    if (!Object.values(CEFRLevel).includes(code as CEFRLevel)) {
      throw new NotFoundException('Level not found.');
    }

    const level = await this.prisma.client.level.findUnique({
      where: { code: code as CEFRLevel },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        order: true,
        courses: {
          orderBy: { order: 'asc' },
          select: { id: true, title: true, slug: true, description: true, order: true },
        },
      },
    });

    if (!level) {
      throw new NotFoundException('Level not found.');
    }
    return level;
  }
}
