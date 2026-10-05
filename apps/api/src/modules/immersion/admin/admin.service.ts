import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@deutschflow/types';
import { Prisma } from '@deutschflow/database';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { daysAgo } from '../common/dates';
import { ADMIN_RESOURCES, findResource, type AdminResource } from './admin-resources';

/** Optional JSON columns: null must be written as SQL NULL. */
const NULLABLE_JSON_FIELDS = new Set(['extra', 'content']);
const PAGE_SIZE = 25;

/** Minimal delegate surface the generic CMS needs from each Prisma model. */
interface Delegate {
  findMany(args: unknown): Promise<Record<string, unknown>[]>;
  findUnique(args: unknown): Promise<Record<string, unknown> | null>;
  count(args: unknown): Promise<number>;
  create(args: unknown): Promise<Record<string, unknown>>;
  update(args: unknown): Promise<Record<string, unknown>>;
  delete(args: unknown): Promise<Record<string, unknown>>;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private resource(key: string, role: UserRole): AdminResource {
    const resource = findResource(key);
    if (!resource) throw new NotFoundException('Unknown content type.');
    if (resource.adminOnly && role !== UserRole.ADMIN) throw new ForbiddenException('Only administrators can edit this.');
    return resource;
  }

  private delegate(resource: AdminResource): Delegate {
    return (this.prisma.client as unknown as Record<string, Delegate>)[resource.model]!;
  }

  private validate(resource: AdminResource, body: unknown, partial: boolean) {
    const schema = partial ? resource.schema.partial() : resource.schema;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new BadRequestException(issue ? `${issue.path.join('.') || 'body'}: ${issue.message}` : 'Invalid data.');
    }
    const data: Record<string, unknown> = { ...(parsed.data as Record<string, unknown>) };
    for (const [k, v] of Object.entries(data)) {
      if (v === null && NULLABLE_JSON_FIELDS.has(k)) data[k] = Prisma.DbNull;
    }
    return resource.prepare ? resource.prepare(data) : data;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') throw new ConflictException('An item with this unique value already exists.');
      if (error.code === 'P2003') throw new ConflictException('This item is still in use. Deactivate it instead of deleting it.');
      if (error.code === 'P2025') throw new NotFoundException('Item not found.');
    }
    throw error;
  }

  registry(role: UserRole) {
    return ADMIN_RESOURCES.filter((r) => !r.adminOnly || role === UserRole.ADMIN).map((r) => ({
      key: r.key,
      label: r.label,
      idField: r.idField,
      columns: r.columns,
      readOnlyCreate: Boolean(r.readOnlyCreate),
      fields: Object.keys(r.schema.shape),
    }));
  }

  async list(key: string, role: UserRole, query: { q?: string; page?: number; languageCode?: string }) {
    const resource = this.resource(key, role);
    const page = Math.max(1, query.page ?? 1);
    const where: Record<string, unknown> = {};
    if (query.q) where.OR = resource.search.map((field) => ({ [field]: { contains: query.q, mode: 'insensitive' } }));
    if (query.languageCode && 'languageCode' in resource.schema.shape) where.languageCode = query.languageCode;
    const delegate = this.delegate(resource);
    const [total, items] = await Promise.all([
      delegate.count({ where }),
      delegate.findMany({ where, orderBy: resource.orderBy, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    ]);
    return { total, page, pageSize: PAGE_SIZE, items };
  }

  async get(key: string, role: UserRole, id: string) {
    const resource = this.resource(key, role);
    const item = await this.delegate(resource).findUnique({ where: { [resource.idField]: id } });
    if (!item) throw new NotFoundException('Item not found.');
    return item;
  }

  async create(key: string, role: UserRole, body: unknown) {
    const resource = this.resource(key, role);
    if (resource.readOnlyCreate) throw new BadRequestException('Items of this type are created by the curriculum, not by hand.');
    const data = this.validate(resource, body, false);
    return this.delegate(resource).create({ data }).catch((e: unknown) => this.handleWriteError(e));
  }

  async update(key: string, role: UserRole, id: string, body: unknown) {
    const resource = this.resource(key, role);
    const data = this.validate(resource, body, true);
    return this.delegate(resource).update({ where: { [resource.idField]: id }, data }).catch((e: unknown) => this.handleWriteError(e));
  }

  async remove(key: string, role: UserRole, id: string) {
    const resource = this.resource(key, role);
    await this.delegate(resource).delete({ where: { [resource.idField]: id } }).catch((e: unknown) => this.handleWriteError(e));
    return { deleted: true };
  }

  async dashboard() {
    const db = this.prisma.client;
    const weekAgo = daysAgo(7);
    const dayAgo = daysAgo(1);
    const [users, activeLearners, runsCompleted, runsThisWeek, aiToday, missions, words, topics, exercises, lessons, avgScore] = await Promise.all([
      db.user.count({ where: { deletedAt: null } }),
      db.learnerStats.count({ where: { updatedAt: { gte: weekAgo } } }),
      db.missionRun.count({ where: { status: 'COMPLETED' } }),
      db.missionRun.count({ where: { status: 'COMPLETED', completedAt: { gte: weekAgo } } }),
      db.aiUsageRecord.count({ where: { createdAt: { gte: dayAgo } } }),
      db.mission.count(),
      db.vocabulary.count(),
      db.grammarTopic.count(),
      db.practiceExercise.count(),
      db.lesson.count(),
      db.missionRun.aggregate({ where: { status: 'COMPLETED' }, _avg: { score: true } }),
    ]);
    return {
      users,
      activeLearners,
      runsCompleted,
      runsThisWeek,
      aiRequests24h: aiToday,
      averageMissionScore: avgScore._avg.score != null ? Math.round(avgScore._avg.score) : null,
      content: { missions, words, topics, exercises, lessons },
    };
  }

  async users(query: { q?: string; page?: number }) {
    const page = Math.max(1, query.page ?? 1);
    const where: Prisma.UserWhereInput = query.q ? { email: { contains: query.q, mode: 'insensitive' } } : {};
    const [total, items] = await Promise.all([
      this.prisma.client.user.count({ where }),
      this.prisma.client.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          deletedAt: true,
          profile: { select: { displayName: true } },
          learningProfile: { select: { targetLanguageCode: true, currentLevel: true } },
        },
      }),
    ]);
    return { total, page, pageSize: PAGE_SIZE, items };
  }

  async setRole(actorId: string, userId: string, role: UserRole) {
    if (actorId === userId) throw new BadRequestException('You cannot change your own role.');
    return this.prisma.client.user
      .update({ where: { id: userId }, data: { role }, select: { id: true, email: true, role: true } })
      .catch((e: unknown) => this.handleWriteError(e));
  }
}
