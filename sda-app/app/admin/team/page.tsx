import { Label } from '@/components/Label';
import { requireAdmin } from '@/lib/auth';
import { APP_ROLES, isAppRole, ROLE_LABELS, type GroupVisibility } from '@/lib/roles';
import { createClient } from '@/lib/supabase/server';
import { changeRole, setGroupVisibility } from './actions';
import { InviteForm } from './InviteForm';

export const dynamic = 'force-dynamic';

interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export default async function TeamPage() {
  const me = await requireAdmin();
  const supabase = createClient();
  const [{ data: profiles }, { data: setting }] = await Promise.all([
    supabase.from('profiles').select('id, email, full_name, role').order('full_name'),
    supabase.from('app_settings').select('value').eq('key', 'staff_group_visibility').maybeSingle(),
  ]);
  const visibility: GroupVisibility = setting?.value === 'all' ? 'all' : 'own_groups';

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold">Team und Zugänge</h1>
      <p className="mb-6 text-muted">
        Nur eingeladene Personen können sich anmelden. Es gibt keine offene Registrierung.
      </p>

      <section className="card mb-6">
        <h2 className="mb-3 text-xl font-bold">Person einladen</h2>
        <InviteForm />
      </section>

      <section className="card mb-6">
        <h2 className="mb-3 text-xl font-bold">Team</h2>
        <ul className="divide-y divide-line">
          {((profiles ?? []) as ProfileRow[]).map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{p.full_name || p.email}</p>
                <p className="text-sm text-muted">{p.email}</p>
              </div>
              {p.id === me.id ? (
                <span className="text-sm text-muted">
                  {isAppRole(p.role) ? ROLE_LABELS[p.role] : p.role} (du)
                </span>
              ) : (
                <form action={changeRole} className="flex gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <select
                    name="role"
                    defaultValue={p.role}
                    aria-label={`Rolle von ${p.full_name || p.email}`}
                    className="input"
                  >
                    {APP_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="btn-secondary">
                    Speichern
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="mb-1 text-xl font-bold">
          Wer sieht welche Schüler? <Label kind="OFFENE ENTSCHEIDUNG" />
        </h2>
        <p className="mb-3 text-muted">
          Noch nicht entschieden: Sehen Lehrkräfte und Muttersprachler/innen alle Schüler oder nur
          die ihrer eigenen Gruppen? Die Leitung sieht immer alles.
        </p>
        <form action={setGroupVisibility} className="space-y-2">
          <label className="flex min-h-11 items-center gap-3">
            <input
              type="radio"
              name="visibility"
              value="own_groups"
              defaultChecked={visibility === 'own_groups'}
              className="h-5 w-5"
            />
            Nur eigene Gruppen (Standard)
          </label>
          <label className="flex min-h-11 items-center gap-3">
            <input
              type="radio"
              name="visibility"
              value="all"
              defaultChecked={visibility === 'all'}
              className="h-5 w-5"
            />
            Alle Gruppen
          </label>
          <button type="submit" className="btn-secondary">
            Einstellung speichern
          </button>
        </form>
      </section>
    </main>
  );
}
