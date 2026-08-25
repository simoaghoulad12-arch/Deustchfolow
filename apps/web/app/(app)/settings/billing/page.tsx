import type { Metadata } from 'next';
import Link from 'next/link';
import { PLAN_CATALOG, PLAN_DISPLAY_NAME, SubscriptionPlan } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { getMySubscription } from '@/lib/api/subscription';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { upgradeAction, cancelSubscriptionAction } from './actions';

export const metadata: Metadata = { title: 'Preise & Plan – DeutschFlow' };

const PLAN_ORDER = [SubscriptionPlan.FREE, SubscriptionPlan.PREMIUM, SubscriptionPlan.PRO] as const;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { checkout?: string; error?: string; cancelled?: string };
}) {
  const session = await getSession();
  if (!session) return null; // (app)/layout.tsx already redirects — satisfies TypeScript.

  const subscription = await getMySubscription(session);
  const currentPlan = subscription?.plan ?? SubscriptionPlan.FREE;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Preise &amp; Plan</h1>
        <p className="text-sm text-muted-foreground">
          Dein aktueller Plan ist <span className="font-medium text-foreground">{PLAN_DISPLAY_NAME[currentPlan]}</span>.
        </p>
      </div>

      {searchParams.checkout === 'success' && (
        <FormMessage type="success">
          Zahlung erfolgreich. Dein Plan wird aktualisiert, sobald Stripe die Bestätigung sendet — das
          dauert meist nur wenige Sekunden.
        </FormMessage>
      )}
      {searchParams.checkout === 'cancelled' && (
        <FormMessage type="error">Checkout abgebrochen. Es wurde nichts berechnet.</FormMessage>
      )}
      {searchParams.cancelled === 'requested' && (
        <FormMessage type="success">
          Kündigung vorgemerkt. Du behältst deinen Plan bis zum Ende der bezahlten Periode.
        </FormMessage>
      )}
      {searchParams.error && <FormMessage type="error">{searchParams.error}</FormMessage>}

      <div className="grid gap-6 sm:grid-cols-3">
        {PLAN_ORDER.map((plan) => {
          const entry = PLAN_CATALOG[plan];
          const isCurrent = plan === currentPlan;
          const isPaid = plan !== SubscriptionPlan.FREE;

          return (
            <div
              key={plan}
              className={`flex flex-col gap-4 rounded-lg border p-6 ${
                isCurrent ? 'border-primary ring-1 ring-primary' : 'border-border'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{PLAN_DISPLAY_NAME[plan]}</h2>
                  {isCurrent && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      Aktueller Plan
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{entry.tagline}</p>
              </div>

              <ul className="flex-1 space-y-2 text-sm">
                {entry.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span aria-hidden="true" className="text-primary">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isPaid && !isCurrent && (
                <form action={upgradeAction}>
                  <input type="hidden" name="plan" value={plan} />
                  <Button type="submit" className="w-full">
                    Zu {PLAN_DISPLAY_NAME[plan]} wechseln
                  </Button>
                </form>
              )}

              {isPaid && isCurrent && !subscription?.cancelAtPeriodEnd && (
                <form action={cancelSubscriptionAction}>
                  <Button type="submit" variant="outline" className="w-full">
                    Plan kündigen
                  </Button>
                </form>
              )}

              {isPaid && isCurrent && subscription?.cancelAtPeriodEnd && (
                <p className="text-center text-xs text-muted-foreground">
                  Endet am {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('de-DE') : 'Ende der Periode'}
                </p>
              )}

              {!isPaid && !isCurrent && (
                <p className="text-center text-xs text-muted-foreground">
                  Aktiv nach einer Kündigung deines bezahlten Plans.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Zahlungen laufen sicher über Stripe. Wir speichern niemals deine Kartendaten.{' '}
        <Link href="/settings" className="underline underline-offset-4">
          Zurück zu den Einstellungen
        </Link>
      </p>
    </div>
  );
}
