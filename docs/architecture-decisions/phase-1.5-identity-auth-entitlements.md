# Phase 1.5 — Architecture Quality Gate: Identity, Auth, Entitlements

Status: **Analyse abgeschlossen, noch nicht implementiert.** Dieses Dokument
legt die Architekturentscheidungen fest, bevor in Phase 2 Authentication &
User Management gebaut wird. Es enthält keinen Auth-Code und keine
Schema-Migration — nur die verbindliche Grundlage dafür.

---

## 1. User Identity vs. Role vs. Subscription vs. Entitlement

**Problem am aktuellen Modell:** `Role` enthält aktuell `STUDENT_FREE` /
`STUDENT_PREMIUM`. Das vermischt drei unterschiedliche Konzepte:

- **Identity** — wer ist die Person (Account, Login).
- **Role** — welche funktionale Kapazität hat die Person im System
  (Student, Tutor, Redakteur, Admin, Support). Ändert sich selten.
- **Subscription** — welche kommerzielle Beziehung besteht gerade (Plan,
  Status, Laufzeit). Ändert sich regelmäßig, hat eine Historie.
- **Entitlement** — welche einzelnen Funktionen sind freigeschaltet
  (`AI_TUTOR`, `SPEAKING`, `WRITING_ADVANCED`, `EXAM_PREPARATION`,
  `TUTOR_BOOKING`, …). Wird aus Subscription **abgeleitet**, kann aber auch
  einzeln vergeben werden (Support-Freischaltung, Promo, Beta-Zugang).

Wenn Premium eine Rolle bleibt, wird jeder neue Plan oder jedes neue
Feature-Flag zu einer Enum-Änderung + Migration, und Feature-Checks landen
verstreut als `if (user.role === 'PREMIUM')` im Code. Das ist das
Datenmodellproblem, das laut Auftrag vermieden werden soll.

**Zielarchitektur (Schichtung):**

```
User (Identity)
  └─ role: Role                      // stabil, coarse-grained
  └─ subscriptions: Subscription[]   // historisiert, kommerziell
  └─ entitlementGrants: EntitlementGrant[]  // manuelle Overrides

Subscription.plan → PLAN_ENTITLEMENTS[plan]  // Standard-Freischaltung pro Plan
                                              (Config, keine DB-Migration nötig)
EntitlementGrant                             // zusätzliche/manuelle Freischaltung,
                                              optional befristet (expiresAt)

canAccess(user, "AI_ADVANCED") = 
  PLAN_ENTITLEMENTS[activeSubscription.plan].has("AI_ADVANCED")
  OR entitlementGrants.some(g => g.entitlement === "AI_ADVANCED" && !expired(g))
```

Geplante Modelle (**noch nicht angelegt**, nur Architektur):

```prisma
enum SubscriptionPlan   { FREE PREMIUM PRO }
enum SubscriptionStatus { ACTIVE TRIALING PAST_DUE CANCELED EXPIRED }

model Subscription {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id])
  plan      SubscriptionPlan
  status    SubscriptionStatus
  startedAt DateTime
  endsAt    DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, status])
}

enum Entitlement {
  AI_TUTOR
  SPEAKING
  WRITING_ADVANCED
  EXAM_PREPARATION
  TUTOR_BOOKING
}

model EntitlementGrant {
  id          String      @id @default(uuid()) @db.Uuid
  userId      String      @db.Uuid
  user        User        @relation(fields: [userId], references: [id])
  entitlement Entitlement
  source      String      // z.B. "plan:PREMIUM" | "manual:support" | "promo:XYZ"
  expiresAt   DateTime?
  createdAt   DateTime    @default(now())

  @@unique([userId, entitlement])
}
```

Diese Trennung wird **nicht** in dieser Phase gebaut, nur festgelegt, damit
Premium in Phase 3+ keine Migrationskatastrophe wird.

---

## 2. Rollen

Empfohlene, geprüfte Rollen: **`STUDENT`, `TUTOR`, `CONTENT_EDITOR`,
`ADMIN`, `SUPPORT`.**

- `STUDENT_FREE`/`STUDENT_PREMIUM` entfallen zugunsten von Subscription
  (siehe Punkt 1).
- `SUPPORT` wird neu aufgenommen: für DSGVO-Werkzeuge (Datenexport,
  manuelle Entitlement-Vergabe, begleitete Account-Löschung) wird eine
  Rolle unterhalb von `ADMIN` gebraucht. Sie jetzt im Enum zu ergänzen
  kostet nichts und erspart eine disruptive Migration später.
- **`GUEST` wird keine persistierte DB-Rolle.** Begründung: Ein Guest ist
  per Definition die *Abwesenheit* einer authentifizierten `User`-Zeile —
  es gibt keinen technischen Grund, "keine Session" als Datenbankzeile zu
  modellieren. Es entstünde nur die Versuchung, anonyme Nutzer künstlich
  als DB-Records zu führen. `GUEST` bleibt ausschließlich ein
  Authorization-Layer-Konzept: In NestJS ist "kein `req.user`" bereits die
  Guest-Semantik; im Frontend kann `type EffectiveRole = Role | 'GUEST'`
  in `packages/types` für UI-Gating existieren, ohne dass `GUEST` je in
  Prisma landet.

---

## 3. Authentication — Session-Strategie

**Entscheidung: Datenbank-gestützte Sessions (Auth.js "database" Strategy
mit Prisma-Adapter), kein reines JWT+Refresh.** Das weicht bewusst vom
ursprünglichen Architekturplan ab.

Begründung (Vergleich):

| | Stateless JWT (+Refresh) | DB-Sessions |
|---|---|---|
| Verifikation | schnell, kein DB-Hit | 1 indexierter DB-Read pro Request |
| Sofortiger Logout | schwierig (Blocklist nötig = wieder Zustand) | trivial (Zeile löschen) |
| "Alle Geräte abmelden" | schwierig | trivial (`DELETE WHERE userId=…`) |
| Password-Reset invalidiert andere Sessions | schwierig | trivial |
| Passt zu | öffentliche/mobile API-Konsumenten | Zwei-Tier-Webapp wie DeutschFlow |

DeutschFlow ist (noch) keine öffentliche API für Drittanbieter oder mobile
Clients — die Hauptstärke von JWT (Statelessness für verteilte Konsumenten)
zählt hier wenig, während Revozierbarkeit (Logout, Passwort-Reset,
Account-Löschung, Betrugsreaktion bei Zahlungen) für eine Plattform mit
Zahlungen und persönlichen Daten schwerer wiegt. Auth.js unterstützt die
DB-Strategie mit Prisma-Adapter nativ — keine Eigenentwicklung von
Rotation/Revocation nötig.

JWT wird **nicht verworfen**, sondern gezielt an einer Stelle eingesetzt:
als kurzlebiges internes Service-Token zwischen Next.js-Server und NestJS
(siehe Punkt 4) — nicht als Session-Mechanismus gegenüber dem Browser.

**Weitere Festlegungen:**

- **Refresh-Verhalten:** kein klassisches OAuth-Refresh-Token; stattdessen
  gleitende Session-Verlängerung (Auth.js Default) bei Aktivität.
- **Session Rotation:** Rotation des Session-Tokens bei sicherheitsrelevanten
  Ereignissen (Login, Passwortänderung, Passwort-Reset).
- **Logout:** Session-Zeile serverseitig löschen + Cookie leeren.
  "Alle Geräte abmelden" = alle Session-Zeilen des Users löschen.
- **Password Reset:** einmaliger, kurzlebiger Token (15–30 Min), gehasht in
  eigener `PasswordResetToken`-Tabelle, per E-Mail versendet; nach
  erfolgreichem Reset werden **alle** bestehenden Sessions invalidiert.
- **E-Mail Verification:** eigene, kurzlebige, einmalige Tokens (Auth.js
  `VerificationToken`). Unverifizierte Nutzer bleiben `STUDENT` mit
  FREE-Entitlements nutzbar (Onboarding-Reibung niedrig halten,
  passend zum Freemium-Ziel), aber sicherheits-/zahlungsrelevante
  Aktionen erfordern verifizierte E-Mail.
- **Account Deletion:** Soft-Delete (`deletedAt` + PII-Anonymisierung) mit
  Karenzzeit, danach Hard-Delete-Job. Sessions werden bei Löschantrag
  sofort gekillt, unabhängig von der Karenzzeit.
- **Security bei Sessions:** httpOnly + Secure + SameSite-Cookies, hochentropische
  opake Session-IDs, TTL + Idle-Timeout.
- **CSRF:** Auth.js bringt CSRF-Schutz für seine eigenen Routen mit.
  Da der Browser NestJS idealerweise nie direkt aufruft (siehe Punkt 4),
  ist die CSRF-Angriffsfläche dort minimiert; verbleibende
  State-Changing-Endpunkte bekommen SameSite-Cookies + Origin-Check als
  Defense-in-Depth.
- **Rate Limiting:** auf Next.js-Seite (Login, Registrierung,
  Reset-Anfrage, Verifizierungs-Resend) UND zusätzlich in NestJS
  (`@nestjs/throttler`) als zweite Verteidigungslinie.
- **Brute-Force-Schutz:** exponentielles Backoff / temporäre Sperre nach
  N Fehlversuchen pro Account, generische Fehlermeldungen (kein
  Unterschied zwischen "Account existiert nicht" und "Passwort falsch").

---

## 4. Auth Architecture — Verantwortlichkeiten & Request Flow

- **Authentication-Verantwortung: Next.js**, via Auth.js mit Prisma-Adapter
  direkt gegen dieselbe PostgreSQL-Datenbank (`packages/database`).
  Auth.js verwaltet Login/Registrierung/OAuth/Sessions/CSRF für seine
  eigenen Routen.
- **Authorization-Verantwortung: NestJS**, immer serverseitig neu geprüft.
  Next.js darf UI-seitig grob gaten (Button ausblenden), aber jeder
  privilegierte NestJS-Endpunkt prüft Rolle/Entitlement unabhängig —
  die Meinung des Frontends über die Rolle wird nie vertraut.
- **Wie NestJS die Identität erhält:** Der Browser spricht NestJS nie
  direkt mit dem Auth.js-Session-Cookie an. Stattdessen liest Next.js
  serverseitig (Route Handler/Server Action) die verifizierte Auth.js-
  Session und stellt daraus ein kurzlebiges, signiertes internes
  Service-JWT aus (`sub`, `role`, TTL ~60s), das per
  `Authorization: Bearer` an NestJS gesendet wird.
- **Wie Rollen serverseitig geprüft werden:** NestJS-Guards
  (`RolesGuard`, `EntitlementsGuard`) + Decorators (`@Roles('ADMIN')`,
  `@RequiresEntitlement('AI_TUTOR')`) lesen die verifizierte Identität aus
  dem Request. Rollenprüfung nutzt den signierten Claim (kurze TTL);
  Entitlement-/Subscription-Prüfung fragt aktiv die Datenbank ab, da sich
  Abos dynamischer ändern als eine 60-Sekunden-Token-TTL abbilden sollte.
- **Wie Client-seitige Rollenmanipulation verhindert wird:** Der Browser
  besitzt nur das opake, httpOnly Auth.js-Session-Cookie — kein für JS
  lesbares oder fälschbares Rollen-Payload. Der Claim, dem NestJS
  vertraut, wird ausschließlich serverseitig von Next.js aus der
  autoritativen DB-Session erzeugt, signiert mit einem nur
  Next.js/NestJS bekannten Secret, und von NestJS unabhängig verifiziert
  (Signatur + Ablauf). Es gibt keinen Codepfad, in dem ein
  Browser-gesendeter Wert als Rolle interpretiert wird.

**Request Flow (verbindlich):**

```
Browser
  └─(1) HTTPS + httpOnly Session-Cookie → Next.js (Server Component/Route Handler)
        └─(2) Auth.js validiert Cookie gegen Postgres `Session`-Tabelle → User { id, role, ... }
        └─(3) Next.js-Server stellt kurzlebiges signiertes Service-JWT aus (sub, role, TTL ~60s)
              └─(4) HTTPS + Bearer Service-JWT → NestJS
                    └─(5) AuthGuard prüft Signatur + Ablauf → req.user
                    └─(6) RolesGuard/EntitlementsGuard prüft Rolle bzw. fragt EntitlementsService (DB) ab
                    └─(7) Controller/Service arbeitet strikt auf req.user.id → Prisma → PostgreSQL
              ←(8) Response
        ←(9) Gerenderte Seite / JSON
  ←(10) Response
```

Nie: Browser → NestJS direkt mit einem vom Client editierbaren
Identitäts-/Rollen-Claim.

---

## 5. User Profile — Identity vs. Learning-Daten getrennt

```prisma
model User {                  // Identity + Auth — bleibt schlank
  id             String   @id @default(uuid()) @db.Uuid
  email          String   @unique
  emailVerifiedAt DateTime?
  role           Role     @default(STUDENT)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  deletedAt      DateTime?
}

model UserProfile {           // 1:1 — persönliche/Anzeige-Daten
  userId               String   @id @db.Uuid
  name                 String?
  avatarUrl            String?
  country              String?
  timezone             String?
  nativeLanguage       String?
  explanationLanguage  String?   // Sprache für Erklärungen/UI
  marketingConsent     Boolean  @default(false)
  consentUpdatedAt     DateTime?
}

model LearningProfile {       // 1:1 — lernbezogener Zustand
  userId              String   @id @db.Uuid
  currentCEFRLevel    CEFRLevel?
  targetCEFRLevel     CEFRLevel?
  learningGoal        String?
  placementTestTakenAt DateTime?
}
```

**Warum getrennt:** (a) Datenminimierung — Auth-/Session-Codepfade laden
nie Name/Avatar/Land; (b) unterschiedliche Änderungsfrequenz — Profil
ändert sich selten (Settings-Seite), Lernstatus ändert sich ständig
(Lern-Engine), getrennte Tabellen vermeiden Schreibkonflikte und lassen
das spätere Lernsystem `LearningProfile` eigenständig besitzen; (c)
sauberere DSGVO-Export-/Löschgrenzen (Punkt 6) — Export/Löschung kann pro
Tabelle arbeiten statt einen großen User-Blob zu zerlegen.

---

## 6. DSGVO — technische Architektur (keine Rechtstexte)

- **Account Deletion:** Soft-Delete (`deletedAt` + PII-Anonymisierung),
  definierte Karenzzeit, danach Hard-Delete-Job. Sofortiger Session-Kill
  unabhängig von der Karenzzeit.
- **Data Export:** Durch die Trennung User/UserProfile/LearningProfile/
  Subscription/EntitlementGrant ist ein "Meine Daten"-Export ein
  begrenzter, bekannter Join. Vorschlag: `DataExportRequest`-Tabelle
  (requestedAt, fulfilledAt) bereits jetzt einplanen, damit die Anfrage
  selbst von Anfang an protokolliert wird.
- **Consent Management:** `marketingConsent` + `consentUpdatedAt` auf
  `UserProfile`, optional später eine `ConsentRecord`-Historie für
  nachweisbare Einwilligungsänderungen.
- **Privacy Settings / E-Mail-Präferenzen:** als künftige
  `NotificationPreference`-Struktur eingeplant, noch nicht angelegt.
- **Datenminimierung:** Nur die in Punkt 5 explizit angeforderten Felder
  sind vorgesehen — keine ungefragten Tracking-Felder.
- **Audit Logging:** generische `AuditLog`-Tabelle (Actor, Action, Target,
  Timestamp) für Admin-/Support-Aktionen (Rollenänderung, manuelle
  Entitlement-Vergabe, durch Support ausgeführte Löschungen) — notwendig
  sowohl für DSGVO-Rechenschaftspflicht als auch zur Kontrolle der neuen
  `SUPPORT`-Rolle.

---

## 7. Freemium-/Entitlement-Architektur

Siehe Punkt 1 für das Datenmodell. Verbindlicher Zugriffsvertrag:

```ts
// packages/types
export type Entitlement =
  | 'AI_TUTOR'
  | 'SPEAKING'
  | 'WRITING_ADVANCED'
  | 'EXAM_PREPARATION'
  | 'TUTOR_BOOKING';

// apps/api — EntitlementsService (geplant, noch nicht gebaut)
canAccess(user: AuthenticatedUser, entitlement: Entitlement): Promise<boolean>
```

Nie `if (user.role === 'PREMIUM')`. FREE bekommt ein echtes,
nicht-leeres Standard-Entitlement-Set (z.B. Kern-Curriculum A1–C1 +
Basis-Schreibkorrektur), damit FREE wie gefordert echten Lernwert hat;
PREMIUM/PRO fügen `AI_TUTOR`/`SPEAKING`/tiefere Analyse/`TUTOR_BOOKING`
hinzu. Die Zuordnung Plan → Entitlements lebt in einer zentralen Config
(`PLAN_ENTITLEMENTS`), nicht verstreut in Controllern — ein neuer Plan
oder ein neues Feature-Flag wird dadurch eine Datenänderung, kein
Code-Rollout in jedem betroffenen Endpunkt.

---

## 8. Security Review — wichtigste Risiken

- **IDOR:** Jede NestJS-Query muss auf `req.user.id` (serverseitig
  ermittelt) beschränkt sein — nie eine client-gesendete `userId` als
  "wessen Daten hole ich" ohne Ownership-/Rollen-Check akzeptieren.
- **Privilege Escalation:** Rollen-/Entitlement-Änderungen nur über
  admin-/support-gesicherte, auditierte Endpunkte. Ein `STUDENT` kann
  `role`/`entitlements` niemals über ein generisches "Profil aktualisieren"
  patchen.
- **Mass Assignment:** DTOs als explizite Allow-Lists
  (`class-validator`/`class-transformer`, global `whitelist: true`,
  `forbidNonWhitelisted: true`) — nie den rohen Request-Body direkt in
  ein Prisma-`update()` durchreichen.
- **Insecure Direct Object References:** wie IDOR — immer per
  `WHERE`-Ownership-Filter, nie "die ID ist schwer zu erraten" als
  Schutz.
- **Client-seitige Rollenmanipulation:** strukturell durch Punkt 4
  ausgeschlossen — kein Codepfad liest eine Rolle aus client-
  kontrollierten Daten.
- **Exponierte Secrets:** Service-JWT-Signing-Secret, DB-Credentials,
  künftige OAuth-Client-Secrets ausschließlich in Server-Env
  (nie `NEXT_PUBLIC_*`) — bereits durch die Phase-1-`.env`-Trennung
  vorbereitet.
- **Unsafe Redirects:** OAuth-/Login-/Passwort-Reset-Redirects nur gegen
  eine Allow-List bekannter Origins, nie ein beliebiger `?next=`-Parameter.
- **Rate Limiting:** siehe Punkt 3, gilt für Login/Registrierung/Reset/
  Verifizierung und später Buchungs-/Zahlungs-Endpunkte.
- **Validation:** `class-validator` auf jedem NestJS-DTO — Client-seitige
  Validierung wird nie allein vertraut.
- **Logging sensibler Daten:** nie Passwörter, Tokens, vollständige
  Session-Cookies oder Rohdaten-E-Mails in Bulk-Logs; strukturierte Logs
  referenzieren `userId`, PII-Redaction als Logging-Default statt
  Einzelfall-Disziplin.

---

## 9. Database Review — bestehendes Schema

Aktuelles `packages/database/prisma/schema.prisma`:

| Kriterium | Status | Bewertung |
|---|---|---|
| UUIDs | ✅ `@default(uuid())` + `@db.Uuid` | korrekt |
| Indexes | `@@index([role])` vorhanden | wenig wertvoll sobald Role nicht mehr den Plan kodiert; künftige Indexes auf `Subscription.status`/`userId` werden relevanter |
| Unique Constraints | `email` unique ✅ | fehlt: Case-Insensitivity (zwei E-Mails, die sich nur in Groß-/Kleinschreibung unterscheiden, würden aktuell als unterschiedlich behandelt) — vor Auth-Rollout beheben |
| Timestamps | `createdAt`/`updatedAt` ✅ | fehlt: `deletedAt` für Soft-Delete (Punkt 6) — vor Phase 2 ergänzen |
| Deletion Strategy | nicht modelliert | muss ergänzt werden |
| Relation Design | keine Relationen (Single-Table) | erwartungsgemäß für Phase 1; Phase 2 braucht `UserProfile`, `LearningProfile`, `Subscription`, `EntitlementGrant`, plus Auth.js' `Session`/`Account`/`VerificationToken`, alle FK auf `User.id` |
| Naming Conventions | konsistentes snake_case via `@map`/`@@map`, PascalCase Modelle | ✅ gut, für neue Modelle fortführen |
| Role-Enum-Werte | `GUEST, STUDENT_FREE, STUDENT_PREMIUM, TUTOR, CONTENT_EDITOR, ADMIN` | durch dieses Review überholt → `STUDENT, TUTOR, CONTENT_EDITOR, ADMIN, SUPPORT`, `GUEST` entfernt, FREE/PREMIUM wandert zu Subscription |

Keine dieser Änderungen wird in diesem Pass umgesetzt — nur festgestellt,
wie in Punkt 9 der Aufgabenstellung gefordert ("noch kein komplettes
Learning- oder Marketplace-Schema bauen").

---

## 10. Zusammenfassender Bericht

### Current Architecture

Was ist gut:
- Monorepo, Prisma-Konventionen (UUID, `createdAt`/`updatedAt`, `@map`-
  Namensschema) sind solide und werden fortgeführt.
- Klare App-Trennung Next.js/NestJS erlaubt die jetzt festgelegte
  Auth-Verantwortungsteilung ohne Umbau.
- `packages/types` ist bereits als zentrale Quelle für Domänentypen
  angelegt — passt genau zum geplanten `Entitlement`-Typ.

### Problems

Müssen vor Phase 2 gelöst werden:
1. `Role` vermischt Rolle und Subscription-Tier (`STUDENT_FREE`/
   `STUDENT_PREMIUM`).
2. `GUEST` ist als DB-Rolle unnötig.
3. Keine Soft-Delete-/`deletedAt`-Spalte.
4. Keine Case-Insensitivity für `email`.
5. Kein Entitlement-/Subscription-Modell vorhanden.
6. Keine Trennung Identity/Profile/Learning-Daten.
7. Session-/Auth-Strategie war implizit "JWT+Refresh" ohne Abwägung —
   jetzt korrigiert auf DB-Sessions (Auth.js "database" Strategy).

### Recommended Architecture

- Auth.js (Next.js) mit Prisma-Adapter, DB-Sessions, verantwortlich für
  Authentication.
- NestJS verantwortlich für Authorization, erhält Identität über
  kurzlebiges, serverseitig signiertes Service-JWT von Next.js — nie
  direkt vom Browser.
- Vierschichtiges Modell: Identity (`User`) → Role → Subscription →
  Entitlement → `canAccess()`-Vertrag, niemals rollenbasierte
  Feature-Ifs.
- Rollen: `STUDENT, TUTOR, CONTENT_EDITOR, ADMIN, SUPPORT`; `GUEST` nur
  als Authorization-Layer-Konzept.

### Database Changes

Notwendig vor/während Phase 2 (noch nicht umgesetzt):
- `Role`-Enum auf `STUDENT, TUTOR, CONTENT_EDITOR, ADMIN, SUPPORT`
  ändern, `GUEST`/`STUDENT_FREE`/`STUDENT_PREMIUM` entfernen.
- `User.deletedAt` (Soft-Delete) ergänzen.
- `email`-Normalisierung (lowercase bei Schreibzugriff) einführen.
- Neue Modelle: `UserProfile`, `LearningProfile`, `Subscription`,
  `EntitlementGrant`, plus Auth.js-Standardmodelle (`Session`, `Account`,
  `VerificationToken`).
- `PasswordResetToken` für Passwort-Reset.
- `AuditLog` für Admin-/Support-Aktionen.

### Security Risks

IDOR, Privilege Escalation, Mass Assignment, clientseitige
Rollenmanipulation, exponierte Secrets, unsichere Redirects, fehlendes
Rate-Limiting/Brute-Force-Schutz, Logging sensibler Daten — siehe Punkt 8
für Details und Gegenmaßnahmen je Risiko.

### Phase 2 Plan

1. Prisma-Schema-Migration gemäß "Database Changes" oben.
2. Auth.js-Integration in `apps/web` (Prisma-Adapter, DB-Session-Strategy,
   E-Mail-Provider für Verification/Reset).
3. Service-JWT-Ausstellung in Next.js + `AuthGuard` in NestJS.
4. `RolesGuard` + `EntitlementsGuard` + `EntitlementsService` (liest
   `PLAN_ENTITLEMENTS`-Config + `EntitlementGrant`).
5. Login/Registrierung/Logout/Passwort-Reset/E-Mail-Verifizierung als
   Nest-Endpunkte + Next.js-Seiten.
6. Rate-Limiting (`@nestjs/throttler`) auf Auth-Endpunkten.
7. Grundlegende Tests: Registrierung, Login, geschützter Endpunkt ohne
   gültige Session wird abgelehnt, Rollen-Guard verweigert korrekt.

Kein Schritt aus diesem Plan wurde in diesem Quality Gate umgesetzt —
reine Analyse und Festlegung, wie gefordert.

---

## 11. Nachtrag — Einfachheits-/Overengineering-Check

Zweiter Quality-Gate-Durchlauf mit explizitem Fokus auf Einfachheit. Prüfung
der bisherigen Empfehlungen (Punkte 1–10) auf unnötige Komplexität:

**Bleibt unverändert (kein Overengineering):**
- Monorepo (pnpm + Turborepo) ist gerechtfertigt durch echten Bedarf an
  geteilten Typen zwischen `apps/web` und `apps/api` (`Role`, `CEFRLevel`,
  `Entitlement`) — kein Selbstzweck.
- Ein einziger NestJS-Service mit Modulen (`auth`, `users`, `learning`,
  `tutors`, `bookings`, …) ist der richtige Schnitt für das MVP. Kein
  Microservice-Split — dafür gibt es aktuell keinen technischen Grund
  (kein unabhängiges Skalierungsbedürfnis einzelner Module, kein Team-
  Schnitt, der das rechtfertigt).
- `packages/ui`, `packages/config`, `packages/types`, `packages/database`
  sind bereits minimal und jeweils durch einen konkreten Zweck
  gerechtfertigt — keine zusätzlichen Packages nötig.
- Trennung `User` / `UserProfile` / `LearningProfile` bleibt bestehen —
  explizit vom Auftrag gefordert, nicht optional, und kostet nur eine
  zusätzliche 1:1-Tabelle pro klar getrenntem Zweck.
- Vierschichtiges Modell Identity → Role → Subscription → Entitlement
  bleibt bestehen — das ist die Kernanforderung ("Premium nicht als Rolle")
  und lässt sich nicht weiter vereinfachen, ohne das eigentliche Problem
  (Premium wird sonst zum Rollenproblem) wieder einzuführen.

**Wird vereinfacht (Scope-Reduktion gegenüber Punkt 9/10 oben):**
- **`EntitlementGrant`-Tabelle wird aus dem Phase-2-Scope gestrichen.**
  Für den Start reichen plan-basierte Entitlements
  (`PLAN_ENTITLEMENTS[subscription.plan]`, reine Config, keine Tabelle).
  Manuelle Einzel-Freischaltungen (Support-Trial, Beta-Zugang) sind ein
  echtes, aber noch nicht akutes Bedürfnis — die Tabelle wird erst
  angelegt, wenn ein konkretes Feature sie braucht. `canAccess(user,
  entitlement)` bleibt als Funktionssignatur stabil; die Implementierung
  kann intern von "nur Plan-Lookup" auf "Plan-Lookup + Grants" erweitert
  werden, ohne den Aufrufer zu ändern.
- **`AuditLog`-Tabelle wird aus dem Phase-2-Scope gestrichen.** Wird erst
  gebaut, wenn tatsächlich Admin-/Support-Werkzeuge entstehen (die es in
  Phase 2 noch nicht gibt). Bis dahin gäbe es nichts, das sie befüllen
  würde.
- **`DataExportRequest`-Tabelle wird aus dem Phase-2-Scope gestrichen.**
  Wird erst gebaut, wenn das Datenexport-Feature selbst gebaut wird.
- **`NotificationPreference` bleibt weiterhin nur Konzept**, keine Tabelle
  vor Phase 2.

**Ergebnis:** Der minimal notwendige Phase-2-Datenbank-Scope reduziert sich
auf `User` (angepasst), `UserProfile`, `LearningProfile`, `Subscription`,
`PasswordResetToken`, sowie Auth.js' eigene `Session`/`Account`/
`VerificationToken`-Modelle. Das ersetzt die längere Liste unter Punkt 10
("Database Changes"). Alle gestrichenen Tabellen bleiben in diesem
Dokument als bewusst *aufgeschobene*, nicht *verworfene* Erweiterungen
festgehalten — die Architektur (Punkt 1, `canAccess()`-Vertrag) unterstützt
sie ohne Redesign, sobald sie gebraucht werden.
