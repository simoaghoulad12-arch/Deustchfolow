import 'server-only';
import type { TutorPayoutStatus } from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export interface TutorPayout {
  id: string;
  amountCents: number;
  currency: string;
  status: TutorPayoutStatus;
  createdAt: string;
}

export async function getMyPayouts(user: SessionUser): Promise<TutorPayout[]> {
  const response = await callNestApi('/tutors/me/payouts', user);
  if (!response.ok) return [];
  return response.json();
}
