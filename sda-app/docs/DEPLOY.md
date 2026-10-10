# Veröffentlichung auf Vercel

Die App liegt im Repository im Ordner `sda-app/` (pnpm-Workspace). Voraussetzung: Supabase ist eingerichtet
(siehe `docs/SUPABASE.md`), inklusive Migrationen und erster Leitung.

## 1. GitHub-Repository
Der Code liegt bereits auf GitHub. Vercel veröffentlicht automatisch jeden Stand des Hauptzweigs und erstellt für
jeden Pull Request eine Vorschau.

## 2. Vercel-Projekt anlegen
1. Auf vercel.com: **Add New → Project** → das GitHub-Repository importieren.
2. **Root Directory**: `sda-app` wählen.
3. **Framework Preset**: Next.js (wird erkannt). Install- und Build-Befehl auf Standard lassen; Vercel erkennt pnpm
   über `pnpm-lock.yaml` im Hauptordner des Repositorys.
4. Noch nicht auf „Deploy“ klicken, erst die Umgebungsvariablen eintragen.

## 3. Umgebungsvariablen (Project → Settings → Environment Variables)
| Name | Wert | Umgebung |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL aus Supabase (Settings → API) | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon public` Schlüssel | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` Schlüssel – **geheim**, nur Server | Production (Preview nur, wenn dort eingeladen werden soll) |
| `NEXT_PUBLIC_SITE_URL` | Adresse der App, z. B. `https://app.example.org` | Production |

`SDA_DEV_MEMBER_ROLE` **niemals** setzen (Testzugang, wirkt ohnehin nur im Entwicklungsmodus).

Danach **Deploy**. Die Adresse lautet zunächst `https://<projekt>.vercel.app`.

## 4. Supabase auf die Adresse einstellen
Supabase → Authentication → URL Configuration:
- **Site URL**: die Adresse der App (Vercel-Adresse oder eigene Domain).
- **Redirect URLs**: `https://<adresse>/auth/confirm` hinzufügen. Für Vorschau-Deployments optional
  `https://*-<team>.vercel.app/auth/confirm`.

## 5. Eigene Domain (optional)
1. Vercel → Project → Settings → **Domains** → Domain eintragen, z. B. `app.example.org`.
2. Beim Domain-Anbieter den angezeigten DNS-Eintrag setzen (meist ein CNAME auf `cname.vercel-dns.com`).
3. Warten, bis Vercel „Valid Configuration“ zeigt (HTTPS-Zertifikat kommt automatisch).
4. `NEXT_PUBLIC_SITE_URL` und Supabase-URLs (Schritt 4) auf die eigene Domain ändern, dann neu deployen.

## 6. Prüfen nach dem Veröffentlichen
- Startseite leitet zum Login; Anmelde-Link kommt per E-Mail und führt zurück in die App.
- Leitung sieht „Team und Zugänge“ in den Einstellungen und kann einladen.
- Auf dem Handy: im Browser-Menü „Zum Startbildschirm hinzufügen“ (iPhone: Teilen → „Zum Home-Bildschirm“).
  Die App öffnet sich danach ohne Browserleiste.

## Hinweise
- Neue Migrationen (Ordner `supabase/migrations`) vor dem Deployment des passenden Codes in Supabase ausführen.
- CI (GitHub Actions) prüft bei jedem Pull Request: Lint, Typen, Tests, Build und die Playwright-Tests.
