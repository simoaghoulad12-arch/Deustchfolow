/**
 * Lifecycle states of a tutor booking. Payment integration (Stripe
 * Connect) is Phase 6 — REFUND_PENDING/REFUNDED already exist in the
 * shape so that phase doesn't need to reshape this enum.
 */
export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
  REFUND_PENDING: 'REFUND_PENDING',
  REFUNDED: 'REFUNDED',
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];
