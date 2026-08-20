import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { UserRole } from '@deutschflow/types';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminPaymentsService } from './admin-payments.service';

/** Read-only for both roles — SUPPORT's write authority is limited to
 * initiating refunds (PaymentsController), never editing payment records
 * directly. */
@Controller('payments/admin')
@Roles(UserRole.ADMIN, UserRole.SUPPORT)
export class AdminPaymentsController {
  constructor(private readonly adminPayments: AdminPaymentsService) {}

  @Get('payments')
  listPayments() {
    return this.adminPayments.listPayments();
  }

  @Get('payments/:paymentId')
  getPaymentDetail(@Param('paymentId', ParseUUIDPipe) paymentId: string) {
    return this.adminPayments.getPaymentDetail(paymentId);
  }

  @Get('refunds')
  listRefunds() {
    return this.adminPayments.listRefunds();
  }

  @Get('disputes')
  listDisputes() {
    return this.adminPayments.listDisputes();
  }
}
