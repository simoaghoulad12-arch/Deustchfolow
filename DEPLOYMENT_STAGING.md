# DeutschFlow — Staging Deployment

Ziel-Setup: **Web → Vercel**, **API → Railway (oder Render)**, **PostgreSQL → Managed Postgres**, **Stripe → Test Mode**.

Dieses Dokument beschreibt ausschließlich das **Staging**-Setup. Es enthält
keine echten Secrets, keine Live-Keys, keine Produktions-Konfiguration.
Alle Werte unten sind Platzhalter/Variablennamen — reale Werte gehören
ausschließlich in den Secret-Store der jeweiligen Plattform (Vercel-/
Railway-/Render-Dashboard), niemals in dieses Repository.

---

## 1. Benötigte Services

| Service | Zweck |
|---|---|
| **Vercel** | Hosting `apps/web` (Next.js — Server Actions, Sessions) |
| **Railway** oder **Render** | Hosting `apps/api` (NestJS) — muss ein **persistenter** Prozess sein (kein Serverless/Edge), wegen `@Cron('*/5 * * * *')` in `abandoned-booking-cleanup.service.ts` und In-Memory-Rate-Limiting |
| **Managed PostgreSQL** | Eine dedizierte Staging-DB, getrennt von Produktion |
| **Stripe (Test Mode)** | Checkout + zwei Webhook-Endpoints |
| **Anthropic** | Optional — AI-Features scheitern kontrolliert ohne Key, kein Blocker |

Kein E-Mail-Provider-Account nötig, um mit dem Testen zu starten — siehe Abschnitt 10.

---

## 2. Vercel-Konfiguration (`apps/web`)

**Neu:** `apps/web/vercel.json` (in diesem Durchgang erstellt) pinnt Install-
und Build-Command explizit auf das offizielle Vercel-Turborepo-Muster,
damit im Dashboard kaum noch manuell konfiguriert werden muss:

```json
{
  "framework": "nextjs",
  "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@deutschflow/web..."
}
```

Im Vercel-Dashboard nur noch nötig:
- **Root Directory:** `apps/web`
- **Framework Preset:** Next.js (wird automatisch erkannt)
- **Output Directory:** automatisch (`​.next`)
- **Node.js Version:** 20.x (Standard, passt zu `engines.node >=20.0.0`)
- Environment Variables (siehe Abschnitt 5)

Kein Dockerfile für `apps/web` — Vercels nativer Next.js-Builder ist hier
die richtige Wahl, kein Zusatznutzen durch Docker.

---

## 3. Railway-Konfiguration (`apps/api`)

**Neu:** `apps/api/Dockerfile` + `.dockerignore` + `railway.json` (Repo-Root).

**Wichtig — Build-Context:** Das Repo ist ein pnpm-Workspace; das Image
braucht `packages/database` und `packages/types` neben `apps/api`. Deshalb:

- **Root Directory in Railway:** **Repository-Root** (nicht `apps/api`!)
- Railway erkennt `railway.json` automatisch und nutzt darüber
  `apps/api/Dockerfile` mit `builder: DOCKERFILE`
- **Healthcheck-Pfad:** `/api/v1/health` (schon in `railway.json` gesetzt)
- **PORT:** nicht manuell setzen — Railway injiziert `PORT` automatisch,
  `main.ts` liest bereits `process.env.PORT ?? 4000`

Der Dockerfile-`CMD` führt bei jedem Container-Start automatisch aus:
```
pnpm --filter @deutschflow/database run migrate:deploy
pnpm --filter @deutschflow/api run start:prod
```
Beides sind die **bereits vorhandenen, unveränderten** package.json-Scripts
— es wurde keine neue Migrations- oder Start-Logik erfunden.

### Alternative: Render

Falls Render statt Railway gewählt wird (kein `render.yaml` in diesem
Durchgang erstellt, um keine ungetesteten Docker-Context-Annahmen für
Render zu riskieren — das machen wir beim gemeinsamen Setup live):

- **Environment:** Docker
- **Dockerfile Path:** `apps/api/Dockerfile`
- **Docker Build Context:** Repository-Root
- **Health Check Path:** `/api/v1/health`
- Start-Command wird vom Dockerfile-`CMD` übernommen (kein separater
  Render-Start-Command nötig)

---

## 4. PostgreSQL

1. Managed-Postgres-Instanz anlegen (Railway-Postgres-Plugin, Render-Postgres,
   Neon, Supabase — beliebig), **dediziert für Staging**, nicht production-shared.
2. Connection-String notieren → wird zu `DATABASE_URL` **und**
   `DIRECT_DATABASE_URL` für **beide** Apps (Web *und* API — Next.js
   greift laut Architektur direkt auf `User`/`Session` zu, siehe
   `apps/web/.env.example`).
3. Ohne Connection-Pooler (Standard bei den meisten Staging-Setups)
   können `DATABASE_URL` und `DIRECT_DATABASE_URL` identisch sein.
   `DIRECT_DATABASE_URL` existiert nur für den Fall eines Poolers
   (z. B. PgBouncer/Prisma Accelerate) vor `DATABASE_URL`.

---

## 5. Environment Variables (vollständig, ohne Secret-Werte)

### Web (Vercel)
| Variable | Pflicht | Hinweis |
|---|---|---|
| `DATABASE_URL` | Ja | Gleiche Staging-DB wie API |
| `DIRECT_DATABASE_URL` | Ja | S. Abschnitt 4 |
| `APP_URL` | Ja | Öffentliche Vercel-URL, **ohne** trailing slash |
| `NEST_API_URL` | Ja | Öffentliche Railway/Render-URL **inkl. `/api/v1`** |
| `SERVICE_TOKEN_SECRET` | Ja | Muss **identisch** mit dem API-Wert sein |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Ja | `pk_test_...` |
| `NEXT_PUBLIC_API_URL` | Nein | **Im Code ungenutzt** — kein Import verweist darauf (jetzt in `.env.example` kommentiert) |
| `NODE_ENV` | Automatisch (Vercel) | Löst den E-Mail-Blocker aus, s. Abschnitt 10 |

### API (Railway/Render)
| Variable | Pflicht | Hinweis |
|---|---|---|
| `DATABASE_URL`, `DIRECT_DATABASE_URL` | Ja | Gleiche Staging-DB |
| `NODE_ENV` | Ja | `production` |
| `PORT` | Nein | Von der Plattform injiziert |
| `APP_URL` | Ja | Muss auf die **Web**-URL zeigen (Stripe-Redirects) |
| `SERVICE_TOKEN_SECRET` | Ja | Identisch zu Web |

### Stripe (nur API)
| Variable | Hinweis |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` — `StripeService` verweigert `sk_live_...` aktiv |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Für `POST /api/v1/payments/webhooks/stripe` |
| `STRIPE_CONNECT_WEBHOOK_SECRET` | Für `POST /api/v1/payments/webhooks/stripe-connect` |
| `STRIPE_PRICE_ID_PREMIUM`, `STRIPE_PRICE_ID_PRO` | Aus dem Stripe-Test-Produktkatalog |

### Anthropic (nur API, optional)
| Variable | Hinweis |
|---|---|
| `AI_PROVIDER` | `"claude"` |
| `ANTHROPIC_API_KEY` | Fehlt er, scheitern AI-Features kontrolliert |
| `ANTHROPIC_MODEL`, `ANTHROPIC_TIMEOUT_MS`, `ANTHROPIC_MAX_RETRIES` | Optional |

### Email
Kein Provider verdrahtet, keine Variable definiert. Siehe Abschnitt 10.

### Sonstige
Keine weiteren Variablen im Code gefunden.

---

## 6. Build Commands

| App | Command |
|---|---|
| `apps/web` (Vercel) | `pnpm turbo run build --filter=@deutschflow/web...` (aus `apps/web/vercel.json`) |
| `apps/api` (Railway/Render) | Im Docker-Image: `pnpm --filter @deutschflow/types build && pnpm --filter @deutschflow/database build && pnpm --filter @deutschflow/api build` |

Turborepo baut `@deutschflow/types` und `@deutschflow/database` automatisch
vor `@deutschflow/web`/`@deutschflow/api` (siehe `dependsOn: ["^build"]`
in `turbo.json`) — beide Deploy-Pfade nutzen exakt dieselbe Reihenfolge.

## 7. Start Commands

| App | Command |
|---|---|
| `apps/web` | Von Vercel automatisch verwaltet (kein `next start` nötig) |
| `apps/api` | `pnpm --filter @deutschflow/api run start:prod` (im Dockerfile-`CMD`, nach der Migration) |

## 8. Migration

- **Automatisch:** Der Dockerfile-`CMD` führt vor jedem Start
  `pnpm --filter @deutschflow/database run migrate:deploy` aus
  (`prisma migrate deploy` — idempotent, bereits angewandte Migrationen
  werden übersprungen).
- **Manuell (Alternative/Erststart-Kontrolle):**
  ```
  DATABASE_URL="<staging-url>" DIRECT_DATABASE_URL="<staging-url>" \
    pnpm --filter @deutschflow/database run migrate:deploy
  ```
  von deinem lokalen Rechner aus, bevor der erste API-Traffic ankommt.

## 9. Seed

**Niemals automatisch, niemals im Container.** `packages/database/prisma/seed.ts`
verweigert sich bereits selbst, wenn `NODE_ENV=production` gesetzt ist
(bestehende, unveränderte Schutzlogik). Zusätzlich ist `prisma db seed`
bewusst **nicht** Teil des Dockerfile-`CMD` — Seeding bleibt ein
manueller, lokaler Schritt:

```
DATABASE_URL="<staging-url>" DIRECT_DATABASE_URL="<staging-url>" \
  pnpm --filter @deutschflow/database run seed
```

Wichtig: dieser Befehl **von deinem PC aus** ausführen (dessen `NODE_ENV`
lokal nicht `production` ist), niemals als Railway/Render-Deploy-Step —
sonst greift die eingebaute Schutzlogik und bricht kontrolliert ab, was
korrekt ist, aber auf einer Plattform mit `NODE_ENV=production` würde der
Befehl dort ohnehin immer verweigert.

---

## 10. E-Mail-Blocker — sicherer Testaccount-Weg (kein Provider implementiert)

`apps/web/lib/email/email-service.ts` hat aktuell nur `ConsoleEmailProvider`
(Dev-Only) und wirft **absichtlich** einen Fehler, sobald `NODE_ENV=production`
gilt — Registrierung/Passwort-Reset über die UI schlagen auf Vercel also
fehl. Diese Schutzlogik wurde **nicht verändert** (Auftrag: kein
E-Mail-Provider ohne technische Zwangsnotwendigkeit).

**Login prüft `emailVerified` nicht** (`lib/auth/login.ts`) — ein per DB
angelegter Account kann sich sofort einloggen, ganz ohne E-Mail-Flow.
Empfohlener, sicherer Weg für einen Test-Account in Staging (von deinem
PC aus, gegen die Staging-`DATABASE_URL`, **kein Code wird dafür verändert**):

```ts
// einmalig lokal ausführen, z.B. mit:
// DATABASE_URL="<staging-url>" DIRECT_DATABASE_URL="<staging-url>" \
//   pnpm --filter @deutschflow/api exec ts-node --transpile-only -e "$(cat <<'EOF'
import { PrismaClient } from '@deutschflow/database';
import bcrypt from 'bcryptjs';

async function main() {
  const prisma = new PrismaClient();
  const passwordHash = await bcrypt.hash('<lokal frei wählbares Testpasswort>', 12);
  await prisma.user.create({
    data: {
      email: 'staging-test@example.com',
      passwordHash,
      role: 'STUDENT',
      emailVerified: new Date(),
      profile: { create: {} },
      learningProfile: { create: {} },
      subscriptions: { create: { plan: 'FREE', status: 'ACTIVE' } },
    },
  });
  console.log('Staging-Testaccount angelegt.');
}
main();
EOF
)"
```

Nutzt exakt dieselben Modelle/Enums wie `registerUser()` — keine neue
Auth-Logik, kein Umgehen bestehender Regeln, nur ein direkter DB-Insert
mit korrekt gehashtem Passwort. Passwort und E-Mail frei wählen, nicht
committen.

**Falls später doch ein echter Provider gewünscht ist:** Resend/Postmark/SES
hinter dem bestehenden `EmailProvider`-Interface verdrahten — bewusst
nicht in diesem Durchgang gemacht, da nicht technisch zwingend und explizit
ausgeschlossen.

---

## 11. Stripe Test Mode & Webhook-Setup

1. Stripe-Account im **Test Mode** verwenden (dashboard.stripe.com, Toggle
   oben rechts).
2. Zwei Produkte/Preise für PREMIUM/PRO anlegen → Price-IDs →
   `STRIPE_PRICE_ID_PREMIUM` / `STRIPE_PRICE_ID_PRO`.
3. **Erst nachdem die API öffentlich erreichbar ist** (nach dem ersten
   Railway/Render-Deploy), zwei Webhook-Endpoints im Stripe-Dashboard anlegen:
   - `https://<api-domain>/api/v1/payments/webhooks/stripe`
   - `https://<api-domain>/api/v1/payments/webhooks/stripe-connect`

   Beides sind die einzigen zwei `@Public()`-Routen der gesamten API
   (`stripe-webhook.controller.ts`) — Absicherung läuft über
   Stripe-Signaturprüfung, nicht über den internen Service-Token. Eine
   öffentliche URL ist dafür zwingend erforderlich (lokal/Tunnel reicht
   für echtes Staging nicht).
4. Die beiden Signing-Secrets aus dem Dashboard → `STRIPE_WEBHOOK_SECRET`
   / `STRIPE_CONNECT_WEBHOOK_SECRET` in der API nachtragen, API neu deployen.

---

## 12. Health Check

`GET /api/v1/health` — öffentlich (`@Public()`), bereits vorhanden
(`apps/api/src/health/health.controller.ts`). Wird von `railway.json`
(`deploy.healthcheckPath`) und dem Dockerfile-`HEALTHCHECK` genutzt.

---

## 13. Typische Fehler

| Symptom | Ursache |
|---|---|
| Login/Registrierung/Buchung schlägt mit 401/500 zwischen Web und API fehl | `SERVICE_TOKEN_SECRET` in Web und API **nicht identisch** |
| API-Aufrufe von Web schlagen komplett fehl | `NEST_API_URL` fehlt das `/api/v1`-Suffix |
| Stripe-Checkout-Redirect landet auf falscher Domain | `APP_URL` in der API zeigt nicht auf die Web-URL |
| Registrierung wirft 500 auf Vercel | Erwartet — s. Abschnitt 10, kein Bug |
| `prisma migrate deploy` schlägt beim Start fehl | `DATABASE_URL` falsch/nicht erreichbar, oder Root Directory in Railway ist `apps/api` statt Repo-Root (Build-Context sieht dann `packages/` nicht) |
| Docker-Build schlägt bei `pnpm install --frozen-lockfile` fehl | `pnpm-lock.yaml` nicht aktuell zum `package.json` — lokal `pnpm install` laufen lassen und Lockfile committen |
| Healthcheck bleibt rot, obwohl App läuft | `start-period` (20s) zu kurz für den ersten Kaltstart inkl. Migration — in `railway.json`/Render-Dashboard ggf. Timeout erhöhen |
| Stripe verweigert den Key | `sk_live_...` versehentlich statt `sk_test_...` gesetzt — `StripeService` blockt das absichtlich |
| Webhook-Events kommen nicht an | Endpoint-URL im Stripe-Dashboard falsch, oder Endpoint vor dem ersten API-Deploy angelegt (noch keine öffentliche URL vorhanden) |
| Registrierter Testaccount kann sich nicht einloggen | Passwort-Hash nicht mit `bcryptjs`/Cost-Faktor 12 erzeugt (s. Abschnitt 10) |

---

## 14. Rollback-Schritte

- **Web (Vercel):** Über das Vercel-Dashboard → *Deployments* → vorheriges
  Deployment → *Promote to Production* (bzw. entsprechendes Staging-Environment).
  Kein Git-Revert nötig für einen reinen Rollback.
- **API (Railway/Render):** Über das Dashboard → *Deployments* → vorheriges
  erfolgreiches Deployment → *Redeploy*/*Rollback*.
- **Datenbank-Migrationen:** Prisma erzeugt **keine** automatischen
  Down-Migrationen. Vor jedem Staging-Deploy mit neuen Migrationen:
  Backup/Snapshot der Staging-DB ziehen (Plattform-Feature nutzen, falls
  vorhanden). Ein Rollback auf Code-Ebene macht eine bereits angewandte
  Migration nicht rückgängig — im Zweifel eine neue, manuell geschriebene
  Migration erstellen, die die vorherige Änderung zurücknimmt.
- **Genereller Code-Rollback:** `git revert <commit>` auf dem
  Deployment-Branch, dann normalen Deploy-Flow erneut durchlaufen lassen
  (kein Force-Push nötig).

---

## Änderungsverzeichnis dieses Durchgangs

Siehe Antwort im Chat (Abschnitte A/B) für die vollständige, kanonische Liste.
