# Probelauf mit echtem Supabase

Prüft die App wie im Betrieb: Produktions-Build (ohne Testzugang), echtes Supabase mit allen Migrationen,
echte Einladungs- und Anmelde-E-Mails, echte Zugriffsregeln. Alle Namen sind als „Probe“ gekennzeichnet.

## Ablauf (10 Schritte)
1. Leitung nimmt die Einladung an, meldet sich ab und per Magic Link wieder an
2. Nicht eingeladene Adresse bekommt keinen Zugang
3. Leitung lädt eine Lehrkraft ein
4. Daten aus der alten Version importieren (Export wie aus legacy/index.html)
5. Gruppe mit Startdatum heute, Lehrkraft zuordnen, zwei Schüler
6. Lehrkraft sieht nur ihre eigene Gruppe (nicht die importierte) und nicht die Team-Verwaltung
7. Playbook „Heute“ und Stunde dokumentieren (Anwesenheit, Hausaufgabe für Anwesende)
8. Leitung trägt eine Entscheidung ein, Lehrkraft sieht sie, kann aber nicht entscheiden
9. Schüler wird eingeladen, Team-Seiten sind gesperrt, Mini-Test und Hausaufgabe in der Lern-App
10. Lehrkraft sieht Testergebnis, Abgabe und Anwesenheit

## Lokal ausführen
Voraussetzung: Docker, Supabase CLI.
```bash
cd sda-app
supabase start -x studio,imgproxy,storage-api,edge-runtime,logflare,vector,realtime,postgres-meta,supavisor
supabase status -o env   # Werte für .env.local (siehe .env.example), NEXT_PUBLIC_SITE_URL=http://localhost:3000
supabase db reset        # sauberer Stand

# Erste Leitung wie in docs/SUPABASE.md (lokal per API und SQL):
curl -X POST http://127.0.0.1:54321/auth/v1/invite -H "apikey: <service_role>" -H "Authorization: Bearer <service_role>" \
  -H "Content-Type: application/json" -d '{"email":"leitung@probe.test"}'
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c \
  "insert into public.profiles (id, email, full_name, role) select id, email, 'Leitung (Probe)', 'admin' from auth.users where email = 'leitung@probe.test';"

pnpm build && pnpm start -p 3000 &
pnpm exec playwright test -c e2e-supabase/playwright.config.ts
```
Die Anmeldelinks liest der Test aus Mailpit (`http://127.0.0.1:54324`). Mit `PROBE_SHOTS=<ordner>` entstehen Screenshots.

**Nicht gegen das echte Projekt laufen lassen** – der Test legt Probe-Daten an.
