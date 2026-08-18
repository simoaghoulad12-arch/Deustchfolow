import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

/** Hard ceiling on every unbounded admin list below — payment/refund
 * volume grows monotonically and is never cleaned up, so "no limit at
 * all" was a real full-table-scan risk at scale (Phase 6.5 audit
 * finding). Not full pagination (no cursor/skip contract yet) — just the
 * minimum fix of never returning an unbounded result set. */
const MAX_LIST_SIZE = 200;

/**
 * Read-only ADMIN/SUPPORT operational views (quality-gate report §11 —
 * "Admin dashboards: all payments, disputes, refund queue"). Nothing here
 * writes anything; refund initiation stays in RefundService/
 * PaymentsController, policy edits stay in PaymentPolicyService.
 */
@Injectable()
export class AdminPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPayments() {
    return this.prisma.client.payment.findMany({ orderBy: { createdAt: 'desc' }, take: MAX_LIST_SIZE });
  }

  async getPaymentDetail(paymentId: string) {
    const payment = await this.prisma.client.payment.findUnique({
      where: { id: paymentId },
      include: { refunds: { orderBy: { createdAt: 'desc' } } },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }
    return payment;
  }

  async listRefunds() {
    return this.prisma.client.refund.findMany({ orderBy: { createdAt: 'desc' }, take: MAX_LIST_SIZE });
  }

  async listDisputes() {
    return this.prisma.client.payment.findMany({
      where: { disputedAt: { not: null } },
      orderBy: { disputedAt: 'desc' },
      take: MAX_LIST_SIZE,
    });
  }
}
