# Supabase einrichten

Die App braucht ein Supabase-Projekt (Postgres, Anmeldung per E-Mail, Row Level Security).

## 1. Projekt anlegen
1. Auf supabase.com ein Projekt anlegen (Region in der EU wählen, z. B. Frankfurt).
2. **Project Settings → API**: `Project URL`, `anon public` und `service_role` notieren.

## 2. Datenbank einrichten
Die Migrationen in `supabase/migrations/` der Reihe nach ausführen:
- mit der Supabase CLI: `supabase link --project-ref <ref>` und `supabase db push`, oder
- im Dashboard unter **SQL Editor** den Inhalt jeder Datei in Reihenfolge einfügen und ausführen.

Danach gibt es alle Tabellen mit Row Level Security und die 21 offenen Entscheidungen aus der bestehenden Version.

## 3. Anmeldung einstellen (Dashboard → Authentication)
- **Sign In / Providers → Email**: aktiv. **Allow new users to sign up: aus** (keine offene Registrierung).
- **URL Configuration**: Site URL = Adresse der App (z. B. `https://app.example.org`),
  Redirect URLs: `https://app.example.org/auth/confirm` (und `http://localhost:3000/auth/confirm` für lokal).
- **Emails → Templates**: Für „Invite user“ und „Magic Link“ den Inhalt aus `supabase/templates/invite.html`
  und `supabase/templates/magic_link.html` übernehmen (der Link führt auf `/auth/confirm`).
- Für echte E-Mails einen eigenen SMTP-Dienst eintragen (der eingebaute Versand ist stark begrenzt).

## 4. Umgebungsvariablen
Siehe `.env.example`. Lokal in `.env.local`, auf Vercel unter Project → Settings → Environment Variables.
`SUPABASE_SERVICE_ROLE_KEY` nur serverseitig setzen und niemals mit `NEXT_PUBLIC_` beginnen lassen.

## 5. Erste Leitung (Admin) anlegen
Die Admin-Seite kann erst jemand benutzen, der schon Admin ist. Einmalig:
1. Dashboard → Authentication → Users → **Invite user** mit der eigenen E-Mail.
2. Im SQL Editor (Name und E-Mail anpassen):
   ```sql
   insert into public.profiles (id, email, full_name, role)
   select id, email, 'Name der Leitung', 'admin' from auth.users where email = 'leitung@example.org';
   ```
3. Einladungslink in der E-Mail öffnen. Danach alle weiteren Personen über **Team und Zugänge** einladen.

## Zugriffsregeln (Kurzfassung)
| | admin | teacher / native | nicht eingeladen |
|---|---|---|---|
| Team, Einstellungen, Entscheidungen | lesen und ändern | lesen | nichts |
| Gruppen | alle, verwalten | eigene (oder alle, je nach Einstellung) | nichts |
| Schüler, Fehler, Hausaufgaben | alle | sichtbare Gruppen: lesen, anlegen, bearbeiten; nicht löschen | nichts |
| Dokumentation | alle | sichtbare Gruppen; nur eigene bearbeiten | nichts |
| Checklisten-Häkchen | alle lesen | nur eigene | nichts |

„Eigene Gruppen“ = Zuordnung in `group_staff`. Ob das Team alle Gruppen sieht, ist eine OFFENE ENTSCHEIDUNG
und unter **Team und Zugänge** umschaltbar (Standard: nur eigene Gruppen).
