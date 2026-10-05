# Umzug: Railway → Neon (Datenbank) + Render (API)

Grund: Der Railway-Testzeitraum ist abgelaufen, alle Dienste sind offline.
Ziel: alles kostenlos. **Vercel (Web) bleibt, wie es ist** — dort werden
nur drei Variablen ausgetauscht.

Kosten: 0 €. Einschränkung: Render-Gratis-Dienste schlafen nach 15 Minuten
ohne Aufruf ein; der erste Aufruf danach dauert ca. 30–60 Sekunden.

Die alten Daten aus der Railway-Datenbank werden **nicht** übernommen —
die neue Datenbank startet leer.

---

## 1. Neon — Datenbank (ca. 3 Minuten)

1. <https://neon.tech> → mit GitHub anmelden.
2. **Create project** → Name `deutschflow`, Region **AWS Europe Central
   (Frankfurt)**, Postgres-Version beliebig (16/17).
3. Auf dem Projekt-Dashboard: **Connect** →
   - Schalter **Connection pooling AUS** → Connection-String kopieren
     → das ist **`DIRECT_DATABASE_URL`**.
   - Schalter **Connection pooling AN** → Connection-String kopieren und
     **am Ende `&pgbouncer=true` anhängen** → das ist **`DATABASE_URL`**.

   Beide sehen aus wie
   `postgresql://user:passwort@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`
   (die gepoolte Variante hat `-pooler` im Hostnamen).

Die Tabellen legt die API beim ersten Start selbst an
(`prisma migrate deploy` im Dockerfile) — dafür ist nichts zu tun.

## 2. Gemeinsames Geheimnis erzeugen

`SERVICE_TOKEN_SECRET` muss in Render **und** Vercel exakt gleich sein.
Einen neuen, zufälligen Wert (mind. 32 Zeichen) erzeugen, z. B. auf
<https://generate-secret.vercel.app/48> oder mit `openssl rand -hex 32`,
und notieren.

## 3. Render — API (ca. 10 Minuten, der erste Build dauert)

1. <https://render.com> → mit GitHub anmelden, Zugriff auf dieses Repo
   erlauben.
2. **New → Blueprint** → dieses Repo wählen, Branch wählen →
   Render findet `render.yaml` und schlägt den Dienst `deutschflow-api`
   (Free, Frankfurt) vor.
3. Render fragt nach vier Werten:

   | Variable | Wert |
   |---|---|
   | `DATABASE_URL` | gepoolte Neon-URL mit `&pgbouncer=true` |
   | `DIRECT_DATABASE_URL` | Neon-URL ohne Pooling |
   | `SERVICE_TOKEN_SECRET` | Wert aus Schritt 2 |
   | `APP_URL` | deine Vercel-Adresse, z. B. `https://xyz.vercel.app` (ohne `/` am Ende) |

4. **Apply** → warten, bis der Dienst „Live“ ist.
5. Oben steht die Adresse, z. B. `https://deutschflow-api.onrender.com`.
   Test im Browser: `https://deutschflow-api.onrender.com/api/v1/health`
   → muss `"status":"ok"` und `"database":"ok"` zeigen.

## 4. Vercel — drei Variablen austauschen

Vercel → Projekt → **Settings → Environment Variables**, jeweils
bearbeiten (Production **und** Preview):

| Variable | Neuer Wert |
|---|---|
| `DATABASE_URL` | gepoolte Neon-URL mit `&pgbouncer=true` |
| `DIRECT_DATABASE_URL` | Neon-URL ohne Pooling |
| `NEST_API_URL` | Render-Adresse **+ `/api/v1`**, z. B. `https://deutschflow-api.onrender.com/api/v1` |
| `SERVICE_TOKEN_SECRET` | Wert aus Schritt 2 |

Dann **Deployments → neuestes Deployment → ⋯ → Redeploy**.

## 5. Inhalte + Test-Account

Die neue Datenbank ist leer (keine Kurse, keine Vokabeln, keine Nutzer).
Registrierung über die Website funktioniert in Produktion noch nicht
(kein E-Mail-Anbieter, siehe `DEPLOYMENT_STAGING.md` Abschnitt 10).
Seed + Test-Account werden einmalig von einem Rechner (oder von Claude) aus mit der
`DIRECT_DATABASE_URL` eingespielt — siehe `DEPLOYMENT_STAGING.md`
Abschnitte 9 (Seed) und 10 (Test-Account).

## 6. Aufräumen

Railway-Projekte `shimmering-spirit` und `thriving-transformation` können
gelöscht werden, sobald alles läuft.
