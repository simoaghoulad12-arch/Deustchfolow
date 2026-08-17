# DeutschFlow

DeutschFlow ist eine Plattform zum Deutschlernen von A1 bis C1 mit
kostenpflichtigen Zusatzservices (echte Konversation, Tutor-Stunden,
Bewerbungstraining, Prüfungsvorbereitung) für den Weg nach Deutschland/EU.

Dieses Repository befindet sich in **Phase 3: Learning Engine
Foundation**. Es enthält Authentication/User-Management (Phase 2) sowie
das technische Fundament des Lernsystems: Level → Course → Module →
Lesson → Exercise, Übungsauswertung, Fortschrittstracking und ein
Dashboard — noch kein fertiges A1–C1-Curriculum (nur wenige
Beispiel-Lektionen zu Entwicklungszwecken), keine Zahlungen, keine
KI-Integration und keine Fake-Daten in Production.

## Tech-Stack

| Bereich | Technologie |
|---|---|
| Monorepo | pnpm Workspaces + Turborepo |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui-Grundstruktur |
| Backend | NestJS |
| Datenbank | PostgreSQL + Prisma |
| Code Quality | ESLint, Prettier, strict TypeScript |
| CI | GitHub Actions |

## Repository-Struktur

```
deutschflow/
├── apps/
│   ├── web/            # Next.js Frontend (Landingpage)
│   └── api/             # NestJS Backend (/api/v1)
├── packages/
│   ├── database/         # Prisma Schema + Client
│   ├── types/             # Geteilte TypeScript-Domänentypen
│   ├── ui/                # Geteilte UI-Utilities (Basis für shadcn/ui-Komponenten)
│   └── config/            # Geteilte TypeScript-/ESLint-/Prettier-Konfiguration
└── .github/workflows/     # CI-Pipeline
```

## Architekturübersicht

- **Monorepo:** pnpm Workspaces + Turborepo orchestrieren `build`, `lint`,
  `typecheck` und `test` über alle Apps/Packages hinweg, mit Caching und
  korrekter Abhängigkeitsreihenfolge.
- **Frontend (`apps/web`):** Next.js App Router, server-first, mobile-first
  gestaltet. Aktuell nur eine minimale Landingpage.
- **Backend (`apps/api`):** NestJS mit modularer Struktur unter
  `src/modules/*` (`auth`, `users`, `learning`, `entitlements`, `progress`,
  `ai-tutor`, `tutors`, `bookings`, `payments`). `auth` stellt die global
  angewendeten `AuthGuard`/`RolesGuard` (Authorization), `users` und
  `learning` liefern die "me"-Endpunkte für Profil/Lernprofil,
  `entitlements` löst Subscription → Entitlements auf. Alle Endpunkte
  liegen unter dem versionierten Prefix `/api/v1`.
- **Authentication vs. Authorization:** Next.js (`apps/web`) besitzt die
  Authentication — eigenes, Auth.js-schema-kompatibles Session-Modul
  (siehe `docs/architecture-decisions/`, Abschnitt 12, warum kein
  `next-auth`-Package). NestJS besitzt die Authorization — jeder Request
  trägt ein kurzlebiges, serverseitig signiertes Service-Token, nie die
  Browser-Session direkt.
- **Datenbank (`packages/database`):** Prisma-Schema mit `User`,
  `UserProfile`, `LearningProfile`, `Subscription`, `PasswordResetToken`,
  `Session`, `Account`, `VerificationToken` sowie der Learning Engine
  (`Level`, `Course`, `Module`, `Lesson`, `Exercise`, `Question`,
  `Option`, `ExerciseAttempt`, `LessonProgress`, `UserSkillProgress`,
  `Vocabulary`, `UserVocabulary`). Das vollständige Marketplace-Datenmodell
  folgt in späteren Phasen.
- **Learning Engine (`apps/api/src/modules/learning`):** Level → Course →
  Module → Lesson → Exercise → Question → Option. Lesekörper unter
  `/api/v1/levels`, `/courses`, `/lessons/:lesson[/exercises]`; Attempts
  unter `POST /exercises/:id/attempts`; eigener Fortschritt unter
  `GET /me/progress`. Grading ist rein regelbasiert (`exercises/grading.ts`)
  — keine KI-Abhängigkeit (siehe
  `docs/architecture-decisions/phase-3-learning-engine.md`). Die
  Exercise-API liefert Optionen serverseitig geshuffelt und **ohne**
  `isCorrect`/`correctAnswer`/`explanation`/`order`, damit ein Client die
  richtige Antwort nicht aus der Response ablesen kann.
- **Rollenmodell:** `STUDENT`, `TUTOR`, `CONTENT_EDITOR`, `SUPPORT`,
  `ADMIN` — zentral in `packages/types`, in Prisma als `Role`-Enum
  gespiegelt. `GUEST` ist bewusst keine DB-Rolle (Abwesenheit einer
  Session).
- **Premium/Entitlements:** `Subscription.plan` (`FREE`/`PREMIUM`/`PRO`)
  ist von `Role` getrennt. Feature-Zugriff läuft ausschließlich über
  `canAccess(user, entitlement)`, nie über `user.role === 'PREMIUM'` —
  siehe `packages/types/src/entitlement.ts` (`PLAN_ENTITLEMENTS`).
- **Geteilte Packages:** `types` (Domänentypen), `ui` (UI-Utilities wie
  `cn()` als Basis für spätere shadcn/ui-Komponenten), `config`
  (TypeScript-/ESLint-/Prettier-Konfiguration), `database` (Prisma) — alle
  vier haben jetzt einen echten `build`-Schritt (`tsc`), damit sie auch
  von kompiliertem Node-Code (z. B. `apps/api`'s `dist/`) zur Laufzeit
  konsumiert werden können, nicht nur von Bundlern wie Next.js oder
  ts-basierten Testrunnern.

## Lokale Installation

Voraussetzungen: Node.js ≥ 20, pnpm ≥ 9, lokal laufendes PostgreSQL (für
später — für das Fundament selbst nicht zwingend erforderlich).

```bash
pnpm install
```

Umgebungsvariablen einrichten (siehe Abschnitt unten):

```bash
cp packages/database/.env.example packages/database/.env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

## Environment Variables

Es wird strikt zwischen `development`, `test` und `production` getrennt.
Es werden **niemals echte Secrets committet** — `.env`-Dateien sind in
`.gitignore` ausgeschlossen, nur `.env.example`-Dateien sind Teil des Repos.

| Variable | Verwendet von | Sichtbarkeit |
|---|---|---|
| `DATABASE_URL` | `packages/database`, `apps/api`, `apps/web` | server-only |
| `DIRECT_DATABASE_URL` | `packages/database`, `apps/api`, `apps/web` | server-only (Migrations bei Connection Pooling) |
| `NODE_ENV` | `apps/api` | server-only |
| `PORT` | `apps/api` | server-only |
| `SERVICE_TOKEN_SECRET` | `apps/api`, `apps/web` | server-only — muss in beiden Apps identisch sein |
| `APP_URL` | `apps/web` | server-only (Links in E-Mails) |
| `NEST_API_URL` | `apps/web` | server-only (Next.js → NestJS, nie der Browser) |
| `NEXT_PUBLIC_API_URL` | `apps/web` | öffentlich (Browser) |

`apps/web` besitzt jetzt auch `DATABASE_URL`, weil Next.js die
Authentication direkt gegen dieselbe Postgres-Datenbank betreibt (siehe
Architekturentscheidung oben).

Server-only Secrets dürfen ausschließlich in `apps/api` bzw.
`packages/database` verwendet werden — niemals in `apps/web`, außer als
`NEXT_PUBLIC_*`-Variable.

## Development Commands

```bash
pnpm dev              # alle Apps im Entwicklungsmodus starten
pnpm --filter @deutschflow/web dev
pnpm --filter @deutschflow/api dev
```

## Test Commands

```bash
pnpm test             # Tests aller Apps/Packages (Turborepo)
pnpm --filter @deutschflow/api test
```

## Build Commands

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Datenbank

```bash
pnpm db:generate                                    # Prisma Client generieren
pnpm db:migrate                                      # Migration lokal anwenden (benötigt laufendes PostgreSQL)
pnpm --filter @deutschflow/database seed             # Dev/Test-Lerninhalte laden (A1, 1 Kurs, 2 Module, 4 Lektionen)
```

Die Seed-Daten sind ausdrücklich **Entwicklungs-/Testdaten**, kein
reales Curriculum (siehe `packages/database/prisma/seed.ts`) — der Seed
verweigert die Ausführung, wenn `NODE_ENV=production` gesetzt ist.

## Sicherheitsregeln

- Keine Secrets committen, `.env` ist in `.gitignore`.
- `.env.example`-Dateien enthalten ausschließlich Platzhalter.
- Keine API-Keys im Repository.
- Keine Fake-Payment-, Fake-AI- oder Fake-Buchungslogik.
- Server-only Secrets niemals im Frontend-Bundle.

## Status & Nicht-Ziele dieser Phase

Bewusst **nicht** enthalten (folgt in späteren Phasen): Stripe/SEPA,
Tutor-Marktplatz-Logik, Video-/Audio-Inhalte, KI-Provider-Integration,
vollständiges A1–C1-Curriculum (nur wenige Beispiel-Lektionen für die
Entwicklung), Content-Editor-Dashboard, Vocabulary-API, echter
Spaced-Repetition-Algorithmus (nur die Datenfelder dafür), Admin-Dashboard,
echter E-Mail-Versand (nur ein Dev-Console-Provider), Testdaten/Fake-Daten
in Production.

## Architekturentscheidungen

Ausführlich dokumentiert unter
[`docs/architecture-decisions/`](docs/architecture-decisions/) —
Identity/Role/Subscription/Entitlement-Trennung, Session-Strategie
(DB-Sessions statt JWT, mit Begründung), Next.js/NestJS-Verantwortlichkeiten
und der Request-Flow zwischen beiden.
