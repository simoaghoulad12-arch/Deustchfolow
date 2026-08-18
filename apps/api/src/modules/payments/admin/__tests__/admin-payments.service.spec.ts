import { NotFoundException } from '@nestjs/common';
import { AdminPaymentsService } from '../admin-payments.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';

function buildPrismaMock(overrides?: {
  payment?: Partial<Record<string, jest.Mock>>;
  refund?: Partial<Record<string, jest.Mock>>;
}) {
  return {
    client: {
      payment: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        ...overrides?.payment,
      },
      refund: {
        findMany: jest.fn().mockResolvedValue([]),
        ...overrides?.refund,
      },
    },
  } as unknown as PrismaService;
}

describe('AdminPaymentsService', () => {
  it('listPayments returns Payment rows ordered newest first, capped at MAX_LIST_SIZE (Phase 6.5: no unbounded query)', async () => {
    const prisma = buildPrismaMock();
    const service = new AdminPaymentsService(prisma);

    await service.listPayments();

    expect(prisma.client.payment.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' }, take: 200 });
  });

  it('getPaymentDetail returns the payment with its refunds included, newest refund first', async () => {
    const payment = { id: 'payment-1', refunds: [] };
    const prisma = buildPrismaMock({ payment: { findUnique: jest.fn().mockResolvedValue(payment) } });
    const service = new AdminPaymentsService(prisma);

    const result = await service.getPaymentDetail('payment-1');

    expect(prisma.client.payment.findUnique).toHaveBeenCalledWith({
      where: { id: 'payment-1' },
      include: { refunds: { orderBy: { createdAt: 'desc' } } },
    });
    expect(result).toBe(payment);
  });

  it('getPaymentDetail throws NotFoundException for a nonexistent payment id', async () => {
    const prisma = buildPrismaMock();
    const service = new AdminPaymentsService(prisma);

    await expect(service.getPaymentDetail('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('listRefunds returns Refund rows ordered newest first, capped at MAX_LIST_SIZE', async () => {
    const prisma = buildPrismaMock();
    const service = new AdminPaymentsService(prisma);

    await service.listRefunds();

    expect(prisma.client.refund.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' }, take: 200 });
  });

  it('listDisputes returns only Payment rows with disputedAt set, ordered by disputedAt descending, capped at MAX_LIST_SIZE', async () => {
    const prisma = buildPrismaMock();
    const service = new AdminPaymentsService(prisma);

    await service.listDisputes();

    expect(prisma.client.payment.findMany).toHaveBeenCalledWith({
      where: { disputedAt: { not: null } },
      orderBy: { disputedAt: 'desc' },
      take: 200,
    });
  });
});
