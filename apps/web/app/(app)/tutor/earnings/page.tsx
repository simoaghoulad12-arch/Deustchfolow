import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { UserRole } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { getMyPayouts } from '@/lib/api/tutor-payouts';
import { PAYOUT_STATUS_LABELS, formatPrice } from '@/lib/tutor-labels';

export const metadata: Metadata = { title: 'Einnahmen – DeutschFlow' };

export default async function TutorEarningsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== UserRole.TUTOR) redirect('/dashboard');

  const payouts = await getMyPayouts(session);
  const totalPaidCents = payouts
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amountCents, 0);
  const currency = payouts[0]?.currency ?? 'EUR';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Einnahmen</h1>
        <p className="text-sm text-muted-foreground">Deine Auszahlungen über Stripe Connect.</p>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="text-xs uppercase text-muted-foreground">Insgesamt ausgezahlt</p>
        <p className="mt-1 text-xl font-semibold">{formatPrice(totalPaidCents, currency)}</p>
      </div>

      {payouts.length === 0 && (
        <p className="text-sm text-muted-foreground">Noch keine Auszahlungen.</p>
      )}

      <ul className="space-y-2">
        {payouts.map((payout) => (
          <li
            key={payout.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
          >
            <div>
              <p className="font-medium">{formatPrice(payout.amountCents, payout.currency)}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(payout.createdAt).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </p>
            </div>
            <span className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
              {PAYOUT_STATUS_LABELS[payout.status]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
