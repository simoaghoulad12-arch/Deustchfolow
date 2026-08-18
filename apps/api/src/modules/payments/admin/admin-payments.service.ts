import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

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
    return this.prisma.client.payment.findMany({ orderBy: { createdAt: 'desc' } });
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
    return this.prisma.client.refund.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async listDisputes() {
    return this.prisma.client.payment.findMany({
      where: { disputedAt: { not: null } },
      orderBy: { disputedAt: 'desc' },
    });
  }
}
