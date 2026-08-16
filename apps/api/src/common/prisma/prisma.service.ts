import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { prisma, type PrismaClient } from '@deutschflow/database';

/**
 * Thin Nest-DI wrapper around the shared Prisma singleton from
 * packages/database. Deliberately does NOT eagerly `$connect()` in
 * `onModuleInit` — Prisma connects lazily on first query, which keeps
 * `Test.createTestingModule({ imports: [AppModule] })` (used by the
 * health e2e test) working without a live database.
 */
@Injectable()
export class PrismaService implements OnModuleDestroy {
  readonly client: PrismaClient = prisma;

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
