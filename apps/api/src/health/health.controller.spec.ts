import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import type { PrismaService } from '../common/prisma/prisma.service';

function buildPrismaMock(queryRaw: jest.Mock = jest.fn().mockResolvedValue([{ '?column?': 1 }])) {
  return { client: { $queryRaw: queryRaw } } as unknown as PrismaService;
}

describe('HealthController', () => {
  it('reports a healthy status and database: ok when the database is reachable', async () => {
    const controller = new HealthController(new HealthService(buildPrismaMock()));

    const result = await controller.check();

    expect(result.status).toBe('ok');
    expect(result.database).toBe('ok');
    expect(typeof result.uptime).toBe('number');
    expect(new Date(result.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('still reports status: ok (liveness) but database: error when the database is unreachable — never a fake healthy DB signal', async () => {
    const prisma = buildPrismaMock(jest.fn().mockRejectedValue(new Error('connection refused')));
    const controller = new HealthController(new HealthService(prisma));

    const result = await controller.check();

    expect(result.status).toBe('ok');
    expect(result.database).toBe('error');
  });
});
