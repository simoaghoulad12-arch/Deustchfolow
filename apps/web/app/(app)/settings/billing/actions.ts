'use server';

import { redirect } from 'next/navigation';
import { SubscriptionPlan } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { createSubscriptionCheckout, cancelSubscription } from '@/lib/api/checkout';

const CHECKOUT_PLANS = [SubscriptionPlan.PREMIUM, SubscriptionPlan.PRO] as const;

export async function upgradeAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  const requested = String(formData.get('plan') ?? '');
  const plan = CHECKOUT_PLANS.find((candidate) => candidate === requested);
  if (!plan) {
    redirect('/settings/billing?error=invalid-plan');
  }

  const result = await createSubscriptionCheckout(session, plan);
  if ('error' in result) {
    redirect(`/settings/billing?error=${encodeURIComponent(result.error)}`);
  }

  redirect(result.url);
}

export async function cancelSubscriptionAction(): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  const { ok } = await cancelSubscription(session);
  if (!ok) {
    redirect('/settings/billing?error=Kündigung%20fehlgeschlagen.%20Bitte%20versuche%20es%20erneut.');
  }

  redirect('/settings/billing?cancelled=requested');
}
