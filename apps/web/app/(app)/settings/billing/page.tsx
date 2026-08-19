import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SubscriptionPlan } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { getMySubscription } from '@/lib/api/subscription';
import { PLAN_LABELS, PLAN_ORDER, PLAN_FEATURES, ENTITLEMENT_LABELS, SUBSCRIPTION_STATUS_LABELS } from '@/lib/plans';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { cn } from '@deutschflow/ui';
import { upgradePlanAction, cancelSubscriptionAction } from './actions';

export const metadata: Metadata = { title: 'Abo & Zahlung – DeutschFlow' };

const CHECKOUT_PLANS = new Set<SubscriptionPlan>([SubscriptionPlan.PREMIUM, SubscriptionPlan.PRO]);

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(value),
  );
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { checkout?: string; cancelRequested?: string; error?: string };
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const subscription = await getMySubscription(session);
  const currentPlan = subscription?.plan ?? SubscriptionPlan.FREE;
  const hasPaidPlan = currentPlan !== SubscriptionPlan.FREE;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-1">
        <Link href="/settings" className="text-sm text-muted-foreground hover:underline">
          ← Zurück zu Einstellungen
        </Link>
        <h1 className="text-2xl font-semibold">Abo & Zahlung</h1>
      </div>

      {searchParams.checkout === 'success' && (
        <FormMessage type="success">
          Zahlung erfolgreich. Dein Plan wird aktualisiert, sobald Stripe die Bestätigung sendet — das
          kann einen Moment dauern.
        </FormMessage>
      )}
      {searchParams.checkout === 'cancelled' && (
        <FormMessage type="error">Checkout abgebrochen. Es wurde nichts berechnet.</FormMessage>
      )}
      {searchParams.cancelRequested && (
        <FormMessage type="success">
          Kündigung vorgemerkt. Dein aktueller Plan bleibt bis zum Ende der bezahlten Periode aktiv.
        </FormMessage>
      )}
      {searchParams.error && <FormMessage type="error">{searchParams.error}</FormMessage>}

      <section className="space-y-2 rounded-lg border border-border p-4">
        <p className="text-sm text-muted-foreground">Aktueller Plan</p>
        <p className="text-lg font-semibold">{PLAN_LABELS[currentPlan]}</p>
        {subscription && (
          <p className="text-sm text-muted-foreground">
            Status: {SUBSCRIPTION_STATUS_LABELS[subscription.status]}
            {subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
              <> · läuft aus am {formatDate(subscription.currentPeriodEnd)}</>
            )}
            {!subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
              <> · nächste Abrechnung am {formatDate(subscription.currentPeriodEnd)}</>
            )}
          </p>
        )}
        {hasPaidPlan && subscription && !subscription.cancelAtPeriodEnd && (
          <form action={cancelSubscriptionAction} className="pt-2">
            <Button type="submit" variant="outline">
              Abo zum Periodenende kündigen
            </Button>
          </form>
        )}
        {hasPaidPlan && subscription?.cancelAtPeriodEnd && (
          <p className="text-xs text-muted-foreground">Kündigung ist bereits vorgemerkt.</p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {PLAN_ORDER.map((plan) => {
          const isCurrent = plan === currentPlan;
          const canCheckout = CHECKOUT_PLANS.has(plan) && !isCurrent;

          return (
            <div
              key={plan}
              className={cn(
                'flex flex-col gap-3 rounded-lg border p-4',
                isCurrent ? 'border-primary bg-primary/5' : 'border-border',
              )}
            >
              <div>
                <p className="font-semibold">{PLAN_LABELS[plan]}</p>
                {isCurrent && <p className="text-xs text-primary">Dein aktueller Plan</p>}
              </div>
              <ul className="flex-1 space-y-1.5 text-sm text-muted-foreground">
                {PLAN_FEATURES[plan].map((entitlement) => (
                  <li key={entitlement}>· {ENTITLEMENT_LABELS[entitlement]}</li>
                ))}
              </ul>
              {canCheckout && (
                <form action={upgradePlanAction}>
                  <input type="hidden" name="plan" value={plan} />
                  <Button type="submit" className="w-full">
                    Zu {PLAN_LABELS[plan]} wechseln
                  </Button>
                </form>
              )}
              {plan === SubscriptionPlan.FREE && !isCurrent && (
                <p className="text-xs text-muted-foreground">
                  Wechsel zu Free erfolgt automatisch nach Kündigung deines aktuellen Plans.
                </p>
              )}
            </div>
          );
        })}
      </section>

      <p className="text-xs text-muted-foreground">
        Preise siehst du im nächsten Schritt bei Stripe, unserem Zahlungsdienstleister. Zahlungen laufen
        vollständig über Stripe Checkout — deine Kartendaten erreichen unsere Server nie.
      </p>
    </div>
  );
}
