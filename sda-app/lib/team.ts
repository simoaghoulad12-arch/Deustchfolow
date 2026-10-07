import 'server-only';
import { cookies } from 'next/headers';
import { getStore } from './data/store';
import { isPerson, normalizeDayRoles, type DayRoles, type Person } from './dayRoles';

export const PERSON_COOKIE = 'sda-person';

/** Wer bin ich im Team-Plan (Lehrkraft 1/2, Muttersprachler/in, alle)? Pro Gerät, wie in legacy. */
export function getPerson(): Person {
  const v = cookies().get(PERSON_COOKIE)?.value;
  return isPerson(v) ? v : 'ALL';
}

export async function getDayRoles(): Promise<DayRoles> {
  return normalizeDayRoles(await getStore().setting('day_roles'));
}
