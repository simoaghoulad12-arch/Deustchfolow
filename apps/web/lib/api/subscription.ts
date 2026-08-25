import 'server-only';
import type { Entitlement, SubscriptionPlan, SubscriptionStatus } from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export interface SubscriptionData {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startedAt: string;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
}

export async function getMySubscription(user: SessionUser): Promise<SubscriptionData | null> {
  const response = await callNestApi('/users/me/subscription', user);
  if (!response.ok) return null;
  return response.json();
}

export async function getMyEntitlements(user: SessionUser): Promise<Entitlement[]> {
  const response = await callNestApi('/entitlements/me', user);
  if (!response.ok) return [];
  const data: { entitlements: Entitlement[] } = await response.json();
  return data.entitlements;
}
