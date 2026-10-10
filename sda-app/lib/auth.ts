import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isMemberRole, type MemberRole } from './roles';
import { createClient } from './supabase/server';

/** Nur Entwicklung/Tests: Rolle des Testzugangs per Cookie umschalten (z. B. auf 'student'). */
export const DEV_ROLE_COOKIE = 'sda-dev-role';

export interface CurrentMember {
  id: string;
  email: string;
  fullName: string;
  role: MemberRole;
}

/**
 * Nur für lokale Entwicklung und Playwright-Tests ohne Supabase: SDA_DEV_MEMBER_ROLE=admin|teacher|native.
 * In einem Produktions-Build ist NODE_ENV immer 'production', dann ist das wirkungslos.
 */
export function devMember(): CurrentMember | null {
  if (process.env.NODE_ENV !== 'development') return null;
  const base = process.env.SDA_DEV_MEMBER_ROLE;
  if (!isMemberRole(base)) return null;
  let role: MemberRole = base;
  try {
    const override = cookies().get(DEV_ROLE_COOKIE)?.value;
    if (isMemberRole(override)) role = override;
  } catch {
    /* außerhalb einer Anfrage (z. B. Build) */
  }
  return role === 'student'
    ? {
        id: 'dev-student',
        email: 'schueler@localhost',
        fullName: 'Testschüler (Entwicklung)',
        role,
      }
    : { id: 'dev', email: 'entwicklung@localhost', fullName: 'Entwicklung (Testzugang)', role };
}

/** Angemeldete Person mit Profil, sonst null (nicht angemeldet oder nicht eingeladen). */
export async function getCurrentMember(): Promise<CurrentMember | null> {
  const dev = devMember();
  if (dev) return dev;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .maybeSingle();
  if (!data) return null;
  return { id: data.id, email: data.email, fullName: data.full_name, role: data.role };
}

export type StaffMember = CurrentMember & { role: Exclude<MemberRole, 'student'> };
export type StudentMember = CurrentMember & { role: 'student' };

/** Team-Bereich: Leitung, Lehrkräfte, Muttersprachler/innen. Schüler werden zur Lern-App geleitet. */
export async function requireMember(): Promise<StaffMember> {
  const member = await getCurrentMember();
  // Angemeldet, aber ohne Profil = nicht eingeladen: kein Zugang.
  if (!member) redirect('/login?fehler=zugang');
  if (member.role === 'student') redirect('/lernen');
  return member as StaffMember;
}

export async function requireAdmin(): Promise<StaffMember> {
  const member = await requireMember();
  if (member.role !== 'admin') redirect('/');
  return member;
}

/** Lern-App: nur Schüler. Das Team landet im Team-Bereich. */
export async function requireStudent(): Promise<StudentMember> {
  const member = await getCurrentMember();
  if (!member) redirect('/login?fehler=zugang');
  if (member.role !== 'student') redirect('/');
  return member as StudentMember;
}
