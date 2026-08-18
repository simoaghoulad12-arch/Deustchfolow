# Phase 5 — Tutor Marketplace + Germany Coach Foundation: Architekturentscheidungen

Dokumentiert vor/während der Implementierung, wie in den vorherigen Phasen.

---

## 1. Double-Booking-Schutz: PostgreSQL EXCLUDE-Constraint, nicht nur App-Code

Ein applikationsseitiger "prüfe auf Überlappung, dann füge ein"-Check hat
ein klassisches TOCTOU-Race-Window: zwei parallele Requests können beide
den Check bestehen, bevor einer von ihnen die eigene Zeile einfügt. Die
Aufgabenstellung verlangt ausdrücklich, dass eine rein clientseitige oder
rein applikationsseitige Prüfung **nicht ausreicht**.

**Entscheidung:** Ein PostgreSQL-`EXCLUDE`-Constraint (via `btree_gist`)
auf `bookings`:

```sql
EXCLUDE USING gist (
  "tutorId" WITH =,
  tstzrange(start_at, end_at) WITH &&
) WHERE (status IN ('PENDING', 'CONFIRMED'))
```

Das ist die einzige race-condition-sichere Lösung — die Datenbank selbst
verweigert den zweiten `COMMIT`, unabhängig davon, wie die beiden
Transaktionen zeitlich verschränkt sind. Prismas Schema-DSL kann
`EXCLUDE`-Constraints nicht ausdrücken, daher wurde die Migration nach
`prisma migrate dev --create-only` von Hand um den SQL-Block ergänzt (siehe
`packages/database/prisma/migrations/20260817185206_phase5_marketplace_and_germany_coach/migration.sql`).

`BookingsService` behält zusätzlich einen applikationsseitigen
Vor-Check — nicht als Schutzmechanismus, sondern nur für eine schnelle,
freundliche Fehlermeldung im Normalfall; der DB-Constraint fängt jeden
Fall ab, den der Vor-Check durch eine Race Condition verpasst
(`SQLSTATE 23P01`, von `BookingsService` auf dieselbe `ConflictException`
abgebildet).

**Verifiziert:** Live in dieser Sandbox mit einer echten Transaktion
(zwei überlappende `CONFIRMED`-Buchungen für denselben Tutor, zweite
INSERT schlägt mit `conflicting key value violates exclusion constraint`
fehl, Transaktion zurückgerollt). Da die bestehende Test-Philosophie
dieses Repos bewusst ohne echte DB in CI läuft (siehe `.github/workflows`),
wird die Race-Condition-Garantie zusätzlich durch ein eigenständiges,
manuell ausführbares Verifikationsskript abgesichert (gleiches Muster wie
`ai:eval` aus Phase 4.5) statt die CI-Pipeline um einen Postgres-Service
zu erweitern — siehe Abschnitt 6.

## 2. Namensgebung: `Offering`, nicht `Service`

Die Aufgabenstellung nennt das buchbare Angebot eines Tutors "Service".
Der AI-Layer aus Phase 4 hat bereits eine Klasse `TutorService`
(`apps/api/src/modules/ai/services/tutor.service.ts`, der KI-Tutor-Chat).
Ein zweites, inhaltlich unabhängiges Konzept ebenfalls "Service" zu nennen
wäre eine garantierte Verwechslungsquelle im Code. **Entscheidung:** Das
Prisma-Modell heißt `Offering`, die NestJS-Klassen entsprechend
`OfferingsService`/`OfferingsController`. Rein eine Namensfrage, keine
fachliche Abweichung von der Spezifikation.

## 3. Zeitzonen: `@db.Timestamptz` + `luxon`, wiederkehrende Regeln lokal gespeichert

`Booking.startAt/endAt` und `TutorAvailabilityException.startAt/endAt`
nutzen explizit `@db.Timestamptz` (der Rest des bestehenden Schemas nutzt
Prismas `DateTime`-Default ohne Zeitzonen-Suffix, da dort reine
Metadaten-Zeitstempel ohne Wall-Clock-Bedeutung stehen — hier ist es
bewusst korrekt-strenger, weil die Aufgabenstellung Zeitzonen-Korrektheit
ausdrücklich verlangt).

`TutorAvailabilityRule` speichert **wiederkehrende** Verfügbarkeit als
Wochentag + lokale Minuten seit Mitternacht, in der Zeitzone des Tutors
— nicht als vorgerechnete UTC-Fenster. Das ist der einzige Weg, mit dem
"jeden Montag 9–17 Uhr Berliner Zeit" die Zeitumstellung korrekt übersteht;
UTC-Fenster im Voraus zu speichern würde beim nächsten DST-Wechsel falsch.
Die Umrechnung in UTC für ein konkretes Datum passiert erst beim Lesen
(`TutorAvailabilityService`), mit `luxon` (neue, gezielte Abhängigkeit in
`apps/api` — manuelle UTC-Offset-Arithmetik ist für DST nicht zuverlässig
korrekt zu implementieren, ein Timezone-Datenbank-gestütztes Werkzeug ist
hier notwendig, nicht optional).

## 4. Real-Life Simulations: bestehendes `ConversationSession` wiederverwenden

Eine Simulation-"Session" hat exakt dieselbe Form wie ein KI-Tutor-Chat
(userId, role, content, metadata, Ownership). Statt einer parallelen
`SimulationSession`-Tabelle bekommt `ConversationSession` ein optionales
`simulationId` (FK auf den neuen `Simulation`-Katalog). Der bestehende
`AiService`/`PromptManager`/Ownership-Code wird direkt wiederverwendet;
nur eine neue, simulationsspezifische Prompt-Quelle kommt hinzu. Ohne
`ANTHROPIC_API_KEY` bleibt der vorbereitete Zustand sauber (kein
`ConversationSession` wird erstellt, bevor nicht wirklich eine Nachricht
gesendet wird — konsistent mit dem bestehenden Tutor-Chat-Verhalten).

## 5. Germany Path: fester Enum statt Workflow-Engine

`GermanyPathStep` ist ein fester, geordneter Enum (9 Schritte aus der
Vorgabe). `currentStep` einer `GermanyPath`-Zeile impliziert: alles davor
ist erledigt, alles danach steht noch aus. Kein separates
"abgeschlossene Schritte"-Set, keine Konfigurationstabelle für
Schrittreihenfolgen. Bewusst die einfachste Lösung für eine explizit als
"Foundation" bezeichnete Anforderung — eine echte, konfigurierbare
Workflow-Engine wäre für neun feste, linear aufeinanderfolgende Schritte
unnötige Komplexität.

## 6. Booking-Konkurrenz-Test: eigenständiges Verifikationsskript statt CI-Postgres

Die bestehende Test-Philosophie (alle `*.spec.ts`/`*.e2e-spec.ts` laufen
gegen gemockten Prisma-Client oder booten `AppModule` ohne echte
DB-Verbindung, siehe `.github/workflows/ci.yml`s Kommentar "no database is
contacted in this pipeline") wird nicht angetastet — eine echte
Race-Condition lässt sich mit einem gemockten Client aber grundsätzlich
nicht beweisen (Mocks haben keine echte Nebenläufigkeit/Locking-Semantik).

**Entscheidung:** Gemockte Unit-Tests prüfen die Service-Logik (Query-
Konstruktion für den Vor-Check, Fehlerbehandlung bei einer simulierten
Exclusion-Violation). Zusätzlich ein eigenständiges, manuell ausführbares
Skript (`apps/api/scripts/verify-booking-concurrency.ts`, gleiches Muster
wie `ai:eval`), das echte parallele Requests gegen die lokale Postgres in
dieser Sandbox feuert und das Ergebnis ehrlich meldet — nicht Teil von
`pnpm test`, aber tatsächlich in dieser Sitzung ausgeführt und im
Completion Report mit echtem Ergebnis dokumentiert.

**Ergebnis (Phase 5.4, tatsächlich ausgeführt):** `pnpm --filter
@deutschflow/api booking:verify-concurrency` mit 8 parallelen
`BookingsService.create()`-Aufrufen für exakt denselben Tutor/Zeitraum:
genau 1 Erfolg, 7 x `ConflictException` (409) über die reale
Postgres-`23P01`-Exclusion-Violation, exakt 1 aktive Buchungszeile in der
DB. Zusätzlich live über den echten HTTP-Layer mit zwei parallelen `curl
POST /bookings`-Requests verschiedener Studierender wiederholt (201 +
409). Damit ist die Race-Condition-Garantie nicht nur behauptet, sondern
gegen eine echte DB bewiesen.

## 7. Dokumenten-Storage: Interface + lokale Dev-Implementierung (Phase 5.6, umgesetzt)

Gleiches Muster wie `AiProvider` aus Phase 4: ein `DocumentStorageProvider`-
Interface (`save`/`read`, storageKey-basiert), eine
`LocalDocumentStorageProvider`-Implementierung (Dateien unter dem
`.gitignore`ten `apps/api/var/tutor-documents/`, niemals über einen
Static-File-Server erreichbar). Kein echter S3/Bucket-Provider in dieser
Phase — es sind keine Cloud-Credentials verfügbar (dieselbe Situation wie
beim fehlenden `ANTHROPIC_API_KEY`), und ein echter Provider wäre ein
reiner Adapter-Austausch hinter demselben Interface, kein
Architektur-Rewrite.

**Abweichung vom ursprünglichen Plan — "signierte URLs".** Statt eines
separaten Query-Token-Schemas wird "signierte URL" hier durch das bereits
bestehende Service-Token-Muster erfüllt: jede Dokument-Content-Route
(`GET /tutors/me/verification/documents/:id/content`,
`GET /tutors/admin/verification/documents/:id/content`) läuft durch
denselben `AuthGuard`/`RolesGuard`/Ownership-Check wie jede andere
Ressource in dieser API — ein frisch geminteter, ~60s gültiger
Service-Token ist funktional bereits eine kurzlebige, signierte
Zugriffsberechtigung. Ein zweites, paralleles Signatur-Schema nur für
Dokumente hätte dieselbe Garantie dupliziert, ohne einen echten
zusätzlichen Sicherheitsgewinn — und würde der Vorgabe "keine unnötige
Änderung der bestehenden Architektur" widersprechen. Ein literales
Query-String-Signatur-Schema ist sinnvoll, sobald ein echter
Objektspeicher (S3-kompatibel) eingeführt wird, wo Downloads direkt vom
Bucket (nicht durch die API) ausgeliefert werden sollen; bis dahin ist es
vorgezogene Komplexität.

## 8. Keine Admin-Frontend-Oberfläche in dieser Phase

Admin-Fähigkeiten (Tutor-Prüfung, Aktivierung, Moderation) werden als
abgesicherte API-Endpunkte mit `RolesGuard(ADMIN)` gebaut und getestet.
Die Aufgabenstellung nennt keine expliziten Admin-Routen (anders als bei
`/tutors`, `/bookings`, `/germany/my-path`, ...). Ein dediziertes
Admin-Dashboard-Frontend wird bewusst zurückgestellt und als offener
Punkt im Completion Report vermerkt, statt spekulativ eine UI zu bauen,
die niemand angefordert hat.

## 9. Booking: serverseitige Verfügbarkeitsprüfung + DTO-Allowlist-Fix

Zwei Entscheidungen aus Phase 5.4:

**Verfügbarkeitsfenster-Validierung.** Eine Buchungsanfrage muss nicht
nur kollisionsfrei sein (EXCLUDE-Constraint), sondern auch innerhalb der
vom Tutor erklärten Zeiten liegen. Dafür eine neue reine Funktion
`isSlotWithinRules` in `availability-slots.ts` (arbeitet mit einem
beliebigen Start-/Endzeitpunkt, nicht mit dem festen Raster von
`computeFreeSlots`) plus `overlapsBusyRange`, aufgerufen über
`TutorAvailabilityService.assertBookable()` — dieselbe Pure-Function-first
Architektur wie in 5.3, aus demselben Grund (DST-Korrektheit ohne
Prisma-Mocking testbar).

**DTO-Allowlist-Fix (während der Live-Verifikation gefunden).** Der
erste Entwurf von `BookingsService`s `BOOKING_INCLUDE` nutzte
`include: { user: { include: { profile: true } } }` für die verschachtelten
Student-/Tutor-User-Objekte — das gibt die komplette `User`-Zeile zurück,
inklusive `passwordHash`, `email`, `deletedAt`. Bei einer Buchung sehen
sich Student und Tutor gegenseitig, sodass das Passwort-Hash der
jeweils anderen Partei über `GET /bookings/me` bzw. `/bookings/tutor/me`
sichtbar gewesen wäre — ein echtes DTO-Allowlist-Problem (Spec Abschnitt
18), gefunden durch tatsächliches Anschauen der Live-API-Antwort, nicht
nur durch Tests. Behoben durch `select` statt `include` mit einer echten
Allowlist (`id`, `profile: { displayName, avatarUrl }`) für beide
Parteien. Lehre: bei jeder neuen Ressource mit verschachtelten
User-Relationen die tatsächliche JSON-Antwort inspizieren, nicht nur den
Typescript-Typ vertrauen.
