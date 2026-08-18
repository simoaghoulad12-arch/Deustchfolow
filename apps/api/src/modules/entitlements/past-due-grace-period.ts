/** True while a PAST_DUE subscription's grace period (PaymentPolicy
 * .pastDueGracePeriodDays, counted from Subscription.pastDueSince) has
 * not yet elapsed — i.e. entitlements should still apply. */
export function isWithinPastDueGracePeriod(
  pastDueSince: Date | null,
  graceDays: number,
  now: Date = new Date(),
): boolean {
  if (!pastDueSince) return false;
  const graceMs = graceDays * 24 * 60 * 60 * 1000;
  return now.getTime() - pastDueSince.getTime() < graceMs;
}
