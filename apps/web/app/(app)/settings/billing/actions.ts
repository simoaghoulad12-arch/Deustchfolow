'use server';

import { redirect } from 'next/navigation';
import { SubscriptionPlan } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { createSubscriptionCheckout, cancelSubscription } from '@/lib/api/payments';

const CHECKOUT_PLANS = new Set<string>([SubscriptionPlan.PREMIUM, SubscriptionPlan.PRO]);

export async function upgradePlanAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  const plan = String(formData.get('plan') ?? '');
  if (!CHECKOUT_PLANS.has(plan)) {
    redirect(`/settings/billing?error=${encodeURIComponent('Ungültiger Plan.')}`);
  }

  const result = await createSubscriptionCheckout(
    session,
    plan as typeof SubscriptionPlan.PREMIUM | typeof SubscriptionPlan.PRO,
  );
  if (!result.ok) {
    redirect(`/settings/billing?error=${encodeURIComponent(result.error)}`);
  }

  redirect(result.data.url);
}

export async function cancelSubscriptionAction(): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  const result = await cancelSubscription(session);
  if (!result.ok) {
    redirect(`/settings/billing?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/settings/billing?cancelRequested=1');
}
