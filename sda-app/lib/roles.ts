/** Rollen im Team (Tabelle profiles). Schüler (student) folgen in Phase 8. */
export const APP_ROLES = ['admin', 'teacher', 'native'] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Leitung (Admin)',
  teacher: 'Lehrkraft',
  native: 'Muttersprachler/in',
};

/** OFFENE ENTSCHEIDUNG: Sieht das Team alle Gruppen oder nur die eigenen? Standard: own_groups. */
export const GROUP_VISIBILITY = ['own_groups', 'all'] as const;
export type GroupVisibility = (typeof GROUP_VISIBILITY)[number];

export const isAppRole = (v: unknown): v is AppRole => APP_ROLES.includes(v as AppRole);
export const isGroupVisibility = (v: unknown): v is GroupVisibility =>
  GROUP_VISIBILITY.includes(v as GroupVisibility);

export interface InviteInput {
  email: string;
  fullName: string;
  role: AppRole;
}

/** Prüft die Eingaben des Einladungsformulars. Gibt eine deutsche Fehlermeldung oder die bereinigten Werte zurück. */
export function parseInvite(form: {
  email?: unknown;
  fullName?: unknown;
  role?: unknown;
}): InviteInput | { error: string } {
  const email = String(form.email ?? '')
    .trim()
    .toLowerCase();
  const fullName = String(form.fullName ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: 'Bitte eine gültige E-Mail-Adresse eingeben.' };
  if (!fullName) return { error: 'Bitte den Namen eingeben.' };
  if (fullName.length > 120) return { error: 'Der Name ist zu lang.' };
  if (!isAppRole(form.role)) return { error: 'Bitte eine Rolle wählen.' };
  return { email, fullName, role: form.role };
}
