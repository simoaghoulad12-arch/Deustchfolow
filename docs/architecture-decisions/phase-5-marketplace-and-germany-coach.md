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

## 10. Real-Life Simulations (Phase 5.8): `TutorService.sendMessage` erweitert statt eigene KI-Pipeline

Konkrete Umsetzung der in Abschnitt 4 getroffenen Entscheidung.
`SendTutorMessageInput` bekommt ein optionales `simulationId`. Beim
Anlegen einer neuen `ConversationSession` (kein `sessionId` übergeben)
wird, falls `simulationId` gesetzt ist, der zugehörige `Simulation`-
Katalogeintrag geladen (404, wenn er fehlt oder `isActive: false` ist)
und auf der Session gespeichert; danach entscheidet ausschließlich das
gespeicherte `simulationId` der Session, welcher System-Prompt gebaut
wird — der Client muss es bei Folgenachrichten nicht erneut mitsenden.
`resolveSystemPrompt()` wählt zwischen `buildTutorPrompt` (Standard) und
dem neuen `buildSimulationPrompt` (Rollenspiel mit `situation`/`goal`/
`roles` aus dem Katalog); beide erzeugen exakt dasselbe
`TutorResponseSchema`, sodass Korrektur-Anzeige, Speicherung und
Frontend-Rendering unverändert bleiben. Es gibt keinen zweiten
KI-Aufruf-Pfad — dieselbe `AiService`/`AiProviderFactory`/
`AiUsageService`-Kette wird durchlaufen wie beim normalen Tutor-Chat,
exakt wie von der Aufgabenstellung gefordert ("AI-Funktionen müssen über
die bestehende AI-Abstraktion laufen").

Wird eine Simulation nach Sessionstart aus dem Katalog entfernt
(`isActive: false` oder gelöscht), fällt `resolveSystemPrompt()` für
Folgenachrichten dieser Session still auf `buildTutorPrompt` zurück,
statt einen Fehler zu werfen — das ist eine nachträgliche
Dateninkonsistenz, kein Client-Fehler, und der Chat soll für den Nutzer
nicht mitten in einer laufenden Konversation abbrechen.

**Katalog-Inhalte (`Simulation`, `CareerModule`) sind Seed-Daten.**
Wie schon die Lerninhalte aus Phase 2 werden Simulationen (11, eine pro
`SimulationCategory`) und Karriere-Module (5, eine pro
`CareerModuleType`) im bestehenden `seed.ts` angelegt statt über eine
neue Admin-CRUD-Oberfläche — sie sind von DeutschFlow kuratierte,
handgeschriebene Inhalte, nicht KI-generiert oder nutzergeneriert, und
das Skript verweigert die Ausführung bei `NODE_ENV === 'production'`.
Ein Karriere-Modul ist zudem bewusst ein statischer Leitfaden zum Lesen,
keine KI-automatisierte Dokumentenerstellung — es gibt in dieser Phase
keine erzwungene KI-Interaktion auf `/career`.

## 11. Phase 5.9: Admin-Moderation + RBAC/IDOR-Härtungspass

**Härtungspass-Ergebnis: keine Regression gefunden.** Eine gezielte
Durchsicht aller Ownership-Checks in `bookings`, `reviews`, `tutors`,
`germany`, `ai`, `simulations` und `career` bestätigt, dass jede einzelne
"gehört nicht mir"/"existiert nicht"-Situation durchgängig
`NotFoundException` wirft, nie `ForbiddenException` — die einzigen
`ForbiddenException`-Vorkommen im gesamten Repo sind Plan-/Entitlement-
Limits (`ai/services/tutor.service.ts`, `correction.service.ts`), nicht
Ownership. Keine Zeile musste als Folge des Passes geändert werden.

**Zwei echte Lücken gefunden und geschlossen.** `Review.isHidden` und
`TutorProfile.isActive` existierten bereits im Schema und wurden bereits
beim Lesen gefiltert (`findVisibleForTutor`, `findMarketplace`,
`findPublicProfile`) — aber es gab keinen einzigen Endpunkt, der diese
Felder tatsächlich setzen konnte. Behoben durch zwei neue,
`@Roles(ADMIN)`-geschützte Routen nach demselben Muster wie
`germany/sources` (Abschnitt 1) und `tutors/admin/verification/...`:

- `PATCH tutors/admin/reviews/:reviewId` (`{ isHidden: boolean }`) —
  versteckt/zeigt eine Bewertung, ohne sie zu löschen (Bewertungshistorie
  bleibt erhalten).
- `PATCH tutors/admin/:tutorId/status` (`{ isActive: boolean }`) —
  Admin-Kill-Switch, entfernt einen Tutor sofort aus Marktplatz-Listing
  und öffentlichem Profil (beide filtern bereits auf `isActive`), ohne
  Buchungs-/Bewertungshistorie zu löschen.

Beide Routen liegen bewusst unter demselben `tutors/admin/...`-Präfix wie
die bestehende Verifikations-Admin-Fläche, in unterschiedlichen
Controllern (`ReviewsController`, `TutorProfilesController`) — die
Pfad-Segmentformen (`admin/reviews/:id` vs. `admin/verification/:id` vs.
`admin/:id/status`) unterscheiden sich an der dritten bzw. vierten
Stelle, sodass keine Routing-Kollision entsteht. Live verifiziert:
Nicht-Admin-Token → 403 (RolesGuard, kein IDOR-Fall — die Route
existiert, die Rolle fehlt), nicht existierende Ressource mit
Admin-Token → 404, ungültiger Body → 400, und die Deaktivierung eines
Tutors macht dessen öffentliches Profil sofort zu einem 404.

## 12. Phase 5.10: Testsuite-Audit für ganz Phase 5

Ein gezielter Coverage-Audit (nicht "mehr Tests um der Zahl willen")
über alle Phase-5-Module ergab einen sauberen Ausgangsbefund
(357 Tests, alle grün) und drei konkrete, geschlossene Lücken:

**IDOR-Lücke: `BookingsService.complete`/`markNoShow`.** Beide Methoden
laufen durch denselben privaten `findOwnedByTutor()`-Helfer wie
`confirm` (der bereits einen "fremder Tutor → 404"-Test hatte), aber
`complete`/`markNoShow` selbst hatten keinen direkten Test dafür — nur
Status-/Zeit-Ablehnungen. Ergänzt: je ein Test "wirft NotFoundException
für eine Buchung eines anderen Tutors" für beide Methoden.

**Cross-Role-IDOR-Lücke bei Bookings.** `GET /bookings/tutor/me` sowie
`PATCH .../confirm|complete|no-show` sind `@Roles(TUTOR)`-geschützt,
aber kein Test bestätigte bisher, dass ein gültiges STUDENT-Token dort
403 bekommt (nur die generische Guard-Fixture in
`authorization.e2e-spec.ts` bewies RolesGuard-Verhalten abstrakt, nie
gegen die echten Booking-Routen). Ergänzt in
`bookings-authorization.e2e-spec.ts`.

**Validierungs-Lücke (repo-weit).** Keine einzige Zeile im Repo
testete bisher, dass die `ValidationPipe` einen fehlerhaften Body
tatsächlich mit 400 ablehnt — jeder bestehende Test schickte entweder
gar keinen Token (401, Guard greift vor der Pipe) oder einen gültigen
Body. Stichprobenartig ergänzt für vier repräsentative DTOs:
`CreateBookingDto` (ungültige `offeringId`/`startAt`),
`CreateReviewDto` (`rating` außerhalb 1–5),
`AdminModerateReviewDto`/`AdminSetTutorStatusDto` (nicht-boolescher
Wert). Diese Tests senden absichtlich ein gültiges, aber unpassend
verifiziertes Token samt kaputtem Body — die Anfrage muss an der
`ValidationPipe` scheitern, bevor der Controller (und damit Prisma)
überhaupt erreicht wird, sodass weiterhin keine echte Datenbank in CI
nötig ist (siehe Abschnitt 6/12-Vorgänger zur No-DB-in-CI-Strategie).

**Technische Falle beim Testen mit echten Tokens (gefunden während
der Umsetzung):** Die neuen Tests mussten zum ersten Mal echte,
signierte Tokens gegen das echte `AppModule` senden (nicht nur
"kein Token" prüfen). `apps/api/.env` setzt bereits ein
`SERVICE_TOKEN_SECRET` für die lokale Entwicklung; die
bestehenden `*-authorization.e2e-spec.ts`-Dateien setzen es defensiv
mit `??=` (nur falls leer) — das war für reine 401-Tests unschädlich,
weil dort nie ein Token signiert wurde. Sobald ein Test tatsächlich ein
Token signiert und verifizieren lässt, muss der Test dieselbe Secret
verwenden wie `verifyServiceToken()` zur Laufzeit tatsächlich liest —
`??=` ist dafür falsch (das `.env`-Secret gewinnt bereits, das
Test-Secret wird nie verwendet, Signaturen passen nicht zusammen →
falsche 401 statt der erwarteten 403/400). Behoben durch eine
unconditionale Zuweisung (`=` statt `??=`), wie es die
Guard-Fixture-Datei `authorization.e2e-spec.ts` bereits vormacht.

**Kein Automatisierungs-Gap beim Booking-Concurrency-Skript.**
`scripts/verify-booking-concurrency.ts` ist absichtlich manuell/nicht
CI-gebunden (siehe Abschnitt 6) — der Audit bestätigt, dass dies weiterhin
so dokumentiert und beabsichtigt ist, keine übersehene Lücke.

Ergebnis: 370 Tests, alle grün, lint/typecheck sauber.

## 13. Phase 5.11: Mobile-UX-Pass (375/390/430px) für alle Phase-5-Seiten

Live-Sweep mit echten Fixture-Daten (Tutor-Profil inkl. Angebot,
Verfügbarkeitsregel, abgeschlossene Buchung, Bewertung) über alle
Phase-5-Seiten — `/tutors`, `/tutors/:id`, `/tutors/:id/book`,
`/bookings`, `/germany/my-path`, `/practice/real-life` (inkl.
Kategorie-Filter), `/practice/real-life/:id`, `/career`,
`/tutor/availability`, `/tutor/bookings`, `/tutor/verification` — bei
allen drei geforderten Breakpoints (375/390/430px), sowohl als Student-
als auch als Tutor-Rolle: 33/33 Prüfungen bestanden, keine horizontale
Überlaufung, keine defekten Seiten.

**Ein echter Bug im Prüfskript selbst gefunden (nicht in der App):**
Der erste Sweep-Lauf prüfte nur `scrollWidth > clientWidth`, nicht den
HTTP-Status — `/tutors/:id/book` ohne den erforderlichen
`?offeringId=`-Query-Parameter liefert korrekt eine 404-Seite (die App
verhält sich richtig: eine Buchungsseite ohne bekanntes Angebot ergibt
keinen Sinn), aber eine 404-Seite hat trivialerweise keinen
horizontalen Überlauf und wurde fälschlich als "ok" gewertet. Das
Prüfskript wurde um eine HTTP-Status-Prüfung (≥400 zählt als Fehler)
ergänzt und mit dem korrekten Query-Parameter erneut ausgeführt — echte
33/33 grün, keine Anwendungsänderung nötig.
