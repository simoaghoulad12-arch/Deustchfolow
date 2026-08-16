# DeutschFlow

DeutschFlow ist eine Plattform zum Deutschlernen von A1 bis C1 mit
kostenpflichtigen Zusatzservices (echte Konversation, Tutor-Stunden,
Bewerbungstraining, Prüfungsvorbereitung) für den Weg nach Deutschland/EU.

Dieses Repository befindet sich in **Phase 1: Technisches Fundament**. Es
enthält ein produktionsnahes Monorepo-Grundgerüst — noch keine vollständige
Lernplattform, keine Zahlungen, keine KI-Integration und keine Fake-Daten.

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
  `src/modules/*` (`auth`, `users`, `learning`, `progress`, `ai-tutor`,
  `tutors`, `bookings`, `payments`). Die Module sind bewusst als leere
  Architektur-Platzhalter angelegt — Business-Logik folgt modulweise in
  späteren Phasen. Alle Endpunkte liegen unter dem versionierten Prefix
  `/api/v1`.
- **Datenbank (`packages/database`):** Prisma-Schema mit minimalem
  `User`-Modell (UUID-Primärschlüssel, `createdAt`/`updatedAt`,
  Rollen-Enum, Index auf `role`). Das vollständige Datenmodell
  (Lerninhalte, Buchungen, Zahlungen, …) wird phasenweise ergänzt.
- **Rollenmodell:** `GUEST`, `STUDENT_FREE`, `STUDENT_PREMIUM`, `TUTOR`,
  `CONTENT_EDITOR`, `ADMIN` — zentral definiert in `packages/types`, in
  Prisma als `Role`-Enum gespiegelt. Autorisierungslogik folgt in Phase 2.
- **Geteilte Packages:** `types` (Domänentypen), `ui` (UI-Utilities wie
  `cn()` als Basis für spätere shadcn/ui-Komponenten), `config`
  (TypeScript-/ESLint-/Prettier-Konfiguration — eine Quelle der Wahrheit
  für Code-Qualität in allen Apps/Packages).

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
| `DATABASE_URL` | `packages/database`, `apps/api` | server-only |
| `DIRECT_DATABASE_URL` | `packages/database`, `apps/api` | server-only (Migrations bei Connection Pooling) |
| `NODE_ENV` | `apps/api` | server-only |
| `PORT` | `apps/api` | server-only |
| `NEXT_PUBLIC_API_URL` | `apps/web` | öffentlich (Browser) |

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
pnpm db:generate      # Prisma Client generieren
pnpm db:migrate       # Migration lokal anwenden (benötigt laufendes PostgreSQL)
```

## Sicherheitsregeln

- Keine Secrets committen, `.env` ist in `.gitignore`.
- `.env.example`-Dateien enthalten ausschließlich Platzhalter.
- Keine API-Keys im Repository.
- Keine Fake-Payment-, Fake-AI- oder Fake-Buchungslogik.
- Server-only Secrets niemals im Frontend-Bundle.

## Status & Nicht-Ziele dieser Phase

Bewusst **nicht** enthalten (folgt in späteren Phasen): Stripe/SEPA,
Tutor-Marktplatz-Logik, Video/Audio, KI-Provider-Integration, vollständige
Authentifizierung/Autorisierung, vollständiges A1–C1-Curriculum,
Admin-Dashboard, Testdaten/Fake-Daten.
