/** Lifecycle states of a tutor/session booking. Payment integration is a later phase. */
export const BookingStatus = {
  REQUESTED: 'REQUESTED',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];
