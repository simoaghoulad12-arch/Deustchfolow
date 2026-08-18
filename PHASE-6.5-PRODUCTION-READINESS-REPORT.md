# PHASE 6.5 — Production Readiness & Real-World Quality Gate

**Datum:** 2026-08-18
**Ziel:** Feststellen, ob die bisherige DeutschFlow-Architektur technisch bereit
für echte Nutzer, echte KI-Nutzung und echte Testzahlungen ist — brutal ehrlich,
ohne künstliche 100%-Bewertung, ohne erfundene Testergebnisse.

---

## Executive Summary

Sechs parallele, unabhängige Recherche-Durchläufe (Auth/Authorization/IDOR,
AI-Sicherheit, Payments/Booking, Database/GDPR/Storage,
Validation/RateLimit/Email/Errors/Observability,
Performance/Free-First/Accessibility) haben das gesamte Repository geprüft.
Das Ergebnis: **eine ungewöhnlich disziplinierte Codebasis** — kein einziger
CRITICAL-Fund bei Authentication, Authorization oder IDOR über 26 geprüfte
API-Controller hinweg. Trotzdem wurden **zwei echte CRITICAL-Bugs** gefunden
und in dieser Phase behoben (eine Race Condition, die Zahlungen doppelt
hätte erstatten können, und eine GDPR-Erasure-Lücke im Tutor-Marktplatz),
sowie eine Reihe von HIGH/MEDIUM-Findings, von denen die eindeutig und
sicher lösbaren ebenfalls in dieser Phase behoben wurden.

**Drei Punkte bleiben unabhängig vom Code offen und werden hier ehrlich als
BLOCKED/CRITICAL dokumentiert, nicht schöngeredet:**

1. Es gibt **keine Frontend-Checkout-UI** — das komplette Phase-6-Zahlungs-
   Backend ist fertig und getestet, aber kein Nutzer kann aktuell tatsächlich
   bezahlen.
2. **Kein echter STRIPE_SECRET_KEY** in dieser Sandbox → echte Stripe-
   Testmodus-Verifikation bleibt BLOCKED (unverändert seit Phase 6).
3. **Kein echter ANTHROPIC_API_KEY** in dieser Sandbox → echte KI-
   Qualitätsevaluation bleibt BLOCKED (unverändert seit Phase 4.5).

Alles, was ohne diese beiden externen Credentials verifizierbar war, wurde
verifiziert: `pnpm lint`, `pnpm typecheck`, `pnpm test` (629/629 grün — 599
`apps/api` + 30 `apps/web`) und `pnpm build` sind über das gesamte Monorepo
erfolgreich.

---

## Current Status

| Phase | Status |
|---|---|
| Phase 1–3 | PASSED |
| Phase 4 | PASSED |
| Phase 4.5 | BLOCKED (kein `ANTHROPIC_API_KEY`) |
| Phase 5 | PASSED |
| Phase 6 | PASSED (Stripe-Sandbox-Punkt BLOCKED, dokumentiert) |
| **Phase 6.5** | **PASS WITH RISK** (siehe Quality Score unten — kein Domain-Bereich ist FAIL, mehrere sind PASS WITH RISK oder BLOCKED aus externen Gründen) |

---

## Critical Findings

### 1. Refund-Race-Condition — **BEHOBEN in dieser Phase**
`RefundService.initiateRefund` berechnete den "verbleibenden erstattbaren
Betrag" nur aus `SUCCEEDED`-Refunds und ignorierte gleichzeitig laufende
`PENDING`-Refunds. Zwei parallele Erstattungsanfragen für dieselbe Zahlung
konnten beide die Prüfung bestehen und die Zahlung gemeinsam überziehen.
**Fix:** Saldo-Prüfung, kumulative SUPPORT-Limit-Prüfung und die lokale
`Refund`-Zeilenerstellung laufen jetzt in einer `SERIALIZABLE`-Transaktion;
ein echter Postgres-Serialisierungskonflikt (Prisma-Fehler `P2034`) wird
sauber als 409 Conflict abgebildet.

### 2. Soft-gelöschte Tutoren blieben im öffentlichen Marktplatz sichtbar — **BEHOBEN in dieser Phase**
`findMarketplace`/`findPublicProfile` filterten nie auf `user.deletedAt` —
ein Tutor, der sein Konto "gelöscht" hatte, blieb unbegrenzt vollständig
im öffentlichen Marktplatz auffindbar und buchbar. Eine echte
Erasure-Request-Compliance-Lücke, kein rein internes Datenproblem.
**Fix:** beide Abfragen filtern jetzt zusätzlich auf `user.deletedAt IS NULL`.

### 3. Keine Frontend-Checkout-UI — **NICHT behoben, dokumentiert**
Kein Stripe.js/Elements, kein Upgrade-Button in `apps/web` — nur eine
schreibgeschützte Plan-Anzeige. Aus dem Rahmen dieses Quality Gates, da
es eine echte neue Feature-Entwicklung wäre, kein Fix. Siehe
`docs/production-readiness/payments.md`.

### 4. Buchungsstornierung löst niemals eine Erstattung aus — **NICHT behoben, dokumentiert**
`BookingsService.cancel()` rührt die `Payment`-Zeile nie an. Braucht eine
echte Policy-Entscheidung (welche Stornierungen, voll vs. anteilig,
Zeitfenster) — genau das, was die Phase-6-Freigabe explizit als
"kein hartcodiertes Refund-Business-Rule" verlangt hat. Nicht improvisiert.

### 5. Keine Konto-Anonymisierung bei Löschung — **NICHT behoben, dokumentiert**
Kontolöschung ist reines Soft-Delete (Zugriff gesperrt), aber
E-Mail/Passwort-Hash/Profildaten bleiben unbegrenzt bestehen. Ein echtes
"Recht auf Löschung" kann aktuell nicht vollständig erfüllt werden.

### 6. Kein echter E-Mail-Provider für Produktion — **NICHT behoben, dokumentiert**
`ConsoleEmailProvider` verweigert korrekt den Start in
`NODE_ENV=production` — bedeutet aber: Registrierung und Passwort-Reset
funktionieren in einem echten Produktions-Deployment aktuell nicht.

### 7. Legal/Tax-Review für Live-Zahlungen — weiterhin offen (bereits aus Phase 6 bekannt).

Details zu allen sieben Punkten: `docs/production-readiness/launch-checklist.md`.

---

## High Findings

- **Refund-Autorität von SUPPORT war pro Anfrage geprüft, nicht kumulativ**
  — **BEHOBEN**: mehrere Einzel-Refunds unter dem Limit konnten zusammen
  eine Zahlung leeren. Jetzt kumulativ pro Zahlung geprüft.
- **Tutor-Verifizierungsdokumente: MIME-Typ nur clientseitig behauptet** —
  **BEHOBEN**: echte Magic-Byte-Signaturprüfung vor der Speicherung
  hinzugefügt (`file-signature.ts`, 7 neue Unit-Tests).
- **`bookings`/`reviews` hatten kein Rate Limiting** — **BEHOBEN**: gleiche
  userId-basierte Throttler-Guards wie bereits bei AI/Payments.
- **Rate Limiting ist ausschließlich In-Memory, Single-Process** — **NICHT
  behoben**: erfordert Redis/Upstash, ausdrücklich nicht blind
  hinzugefügt (siehe Anweisung §13).
- **Kein Consent-Mechanismus** (Cookie-Banner, ToS-Zeitstempel) — **NICHT
  behoben**, Produkt-/Rechtsentscheidung.
- **Kein Malware-Scan für Uploads** — **NICHT behoben**, Vendor-Entscheidung.
- **Keine Request-/Correlation-ID** — **NICHT behoben**, echte neue
  Infrastruktur außerhalb des Fix-Rahmens.
- **Kein verifiziertes DB-Backup/PITR** — kann aus dieser Sandbox heraus
  nicht verifiziert werden, da keine echte Produktions-Infrastruktur
  existiert.

---

## Medium Findings

DST-Bug in der Verfügbarkeits-Slot-Berechnung (**BEHOBEN**, siehe unten),
fehlender DB-Index auf `payments.stripe_charge_id` (**BEHOBEN**), fehlender
`X-Content-Type-Options: nosniff`-Header (**BEHOBEN**), Health-Check prüfte
nie echte DB-Erreichbarkeit (**BEHOBEN**), Angebote konnten mit 0 Cent
angelegt werden (**BEHOBEN**), `learningGoal`-Prompt-Injection-Lücke in der
KI-Sicherheitsanweisung (**BEHOBEN**), mehrere unbegrenzte Admin-/Listen-
Abfragen (**BEHOBEN**, auf 200 Zeilen gedeckelt), zwei fehlende
Accessibility-Labels (**BEHOBEN**). Vollständige Liste mit Fundstellen:
`docs/production-readiness/launch-checklist.md`.

---

## Fixed Issues (this phase, mit Tests)

1. Soft-gelöschte Tutoren aus Marktplatz-Listing/Profil entfernt (2 neue Tests).
2. Refund-Race-Condition per SERIALIZABLE-Transaktion geschlossen (4 neue Tests).
3. Kumulative SUPPORT-Refund-Limit-Prüfung (2 neue Tests).
4. Magic-Byte-Dateisignaturprüfung für Tutor-Verifizierungsdokumente (7 neue Tests).
5. Rate Limiting für `bookings`/`reviews` (BookingsThrottlerGuard/ReviewsThrottlerGuard).
6. DST-Bug in `computeFreeSlots` behoben — `.plus({minutes})` durch
   wall-clock-sicheres `.set({hour, minute})` ersetzt, verifiziert gegen
   Europe/Berlins echten 2026-03-29-Übergang (1 neuer Regressionstest, der
   nachweislich am alten Code fehlgeschlagen wäre).
7. DB-Index auf `payments.stripe_charge_id` (Migration
   `20260818110000_payment_stripe_charge_id_index`).
8. `X-Content-Type-Options: nosniff` global gesetzt, über eine eigenständig
   testbare Hilfsfunktion (`security-headers.ts`, 2 neue Tests).
9. Health-Check prüft jetzt echte DB-Erreichbarkeit über ein separates,
   ehrliches `database`-Feld — `status`/HTTP-Code bleiben bewusst reine
   Liveness-Signale (2 neue Tests, e2e-verifiziert in dieser
   Sandbox ohne laufende DB).
10. Mindestpreis für Angebote auf 50 Cent angehoben (Stripes EUR-Minimum),
    1 neuer e2e-Test.
11. `learningGoal`-Prompt-Injection-Härtung: erweiterte
    Sicherheitsanweisung + visuelle/strukturelle Zitat-Markierung (2 neue Tests).
12. Sieben unbegrenzte Listen-Abfragen auf 200 Zeilen gedeckelt (7 aktualisierte/neue Tests).
13. Zwei Accessibility-Label-Lücken behoben (Schreibkorrektur-Textarea,
    Konto-Löschung-Passwortfeld).

**Gesamtergebnis:** 629/629 Tests grün (599 `apps/api` + 30 `apps/web`),
`pnpm lint`/`typecheck`/`build` sauber über das gesamte Monorepo. Kein
Test wurde geschwächt, entfernt oder umgangen, um Grün zu erreichen.

---

## Deferred Issues

Siehe Abschnitte "Critical Findings" (Punkte 3–7) und "High Findings" oben
für die vollständige Liste dessen, was bewusst nicht in dieser Phase
gelöst wurde, mit Begründung. Zusammengefasst: alles, was entweder (a)
eine echte Produktentscheidung braucht, die diese Phase nicht treffen
darf, (b) eine neue externe Infrastruktur-Abhängigkeit wäre, die
ausdrücklich nicht blind hinzugefügt werden sollte, oder (c) echte externe
Credentials erfordert, die in dieser Sandbox nicht existieren.

---

## AI Status

**BLOCKED — kein echter `ANTHROPIC_API_KEY`** (unverändert seit Phase 4.5).
Architektur-/Sicherheitsprüfung: PASS WITH RISK (ein Prompt-Injection-
Vektor gehärtet, eine bereits dokumentierte Soft-Cap-Race bestätigt, sonst
sauber — kein Secret-Leak, kein Context-Leak, fail-closed
Output-Validierung überall). Details: `docs/production-readiness/ai.md`.
Runbook für die echte Evaluation: `AI_REAL_EVAL_RUNBOOK.md`.

## Stripe Status

**BLOCKED — kein echter `STRIPE_SECRET_KEY`** (unverändert seit Phase 6).
Architektur-/Sicherheitsprüfung: PASS WITH RISK (Webhook-Signatur/
Idempotenz echt verifiziert, DB-Constraints bestätigt, Race Condition in
dieser Phase geschlossen — aber die Frontend-Checkout-UI fehlt komplett,
siehe Critical Findings #3). Details:
`docs/production-readiness/payments.md`. Runbook:
`STRIPE_SANDBOX_RUNBOOK.md`.

## Security Status

**PASS WITH RISK.** Kein CRITICAL/HIGH-Fund bei Auth/Authorization/IDOR
über alle 26 API-Controller. Zwei echte CRITICAL-Bugs (Refund-Race,
Marktplatz-Erasure) gefunden und behoben. Details:
`docs/production-readiness/security.md`.

## GDPR Technical Readiness

**PASS WITH RISK.** Marktplatz-Erasure-Lücke behoben; Konto-Anonymisierung
und Consent-Architektur bleiben offen (Produkt-/Rechtsentscheidungen).
Details: `docs/production-readiness/privacy.md`.

## Performance

**PASS.** Keine N+1-Queries gefunden (systematischer Sweep über alle
Module). KI-Kontext/-Historie ist begrenzt. Verfügbarkeits-Slot-Berechnung
ist auf 30 Tage begrenzt, nicht quadratisch. Sieben unbegrenzte
Listen-Abfragen in dieser Phase gedeckelt.

## Testing

**PASS.** 629/629 Tests grün, keine geschwächten/entfernten Tests. Neue
Tests decken jeden Fix ab, inklusive eines Regressionstests, der
nachweislich am ungefixten Code fehlgeschlagen wäre (DST-Bug).

## Operational Readiness

**BLOCKED (extern bedingt).** Kein Request-Tracing, inkonsistentes
Logging über Module hinweg, kein verifiziertes Backup/PITR (keine echte
Produktions-Infrastruktur in dieser Sandbox vorhanden). Health-Check jetzt
mit echter DB-Prüfung. Details: `docs/production-readiness/monitoring.md`,
`docs/production-readiness/backups.md`.

---

## Launch Blockers

Vollständige, nach CRITICAL/HIGH/MEDIUM sortierte Liste:
`docs/production-readiness/launch-checklist.md`.

---

## Final Quality Score

| Domäne | Score | Begründung |
|---|---|---|
| Architecture | PASS | Konsistent, kein unnötiger Overengineering-Fund. |
| Security (Auth/AuthZ/IDOR) | PASS WITH RISK | Kein CRITICAL/HIGH über 26 Controller; kleinere LOW-Funde dokumentiert. |
| Authentication | PASS | bcrypt-12, Timing-Schutz, sichere Cookies, kein CSRF-Vektor. |
| Authorization | PASS | Global erzwungen, serverseitig, konsistent. |
| Database | PASS WITH RISK | Constraints solide; ein Cascade-Risiko latent (kein Hard-Delete-Pfad existiert aktuell). |
| AI | BLOCKED | Architektur PASS WITH RISK; echte Modellqualität unverifiziert (kein Key). |
| Payments | BLOCKED | Architektur PASS WITH RISK (nach Fixes); echte Stripe-Verifikation unverifiziert (kein Key); Frontend-UI fehlt komplett. |
| Privacy/GDPR | PASS WITH RISK | Marktplatz-Lücke behoben; Anonymisierung/Consent offen. |
| Performance | PASS | Kein N+1, begrenzte KI-Kontexte, unbegrenzte Queries gedeckelt. |
| Mobile UX | PASS (aus Phase 5.11, nicht in dieser Phase erneut live geprüft) | Kein neues UI in Phase 6/6.5, das eine erneute Sweep-Prüfung erfordert. |
| Accessibility | PASS WITH RISK | Zwei Label-Lücken behoben; einige LOW-Funde (aria-describedby-Verdrahtung) dokumentiert, nicht behoben. |
| Testing | PASS | 629/629 grün, keine geschwächten Tests. |
| Observability | BLOCKED | Kein Request-Tracing, inkonsistentes Logging — echte neue Infrastruktur nötig. |
| Operations (Backup/Recovery) | BLOCKED | Keine echte Produktions-Infrastruktur zum Verifizieren vorhanden. |

Keine künstliche Gesamt-Prozentzahl — die Domänen sind absichtlich getrennt
bewertet, weil ein einzelner grüner Unit-Test-Lauf nicht automatisch
Production Ready bedeutet.

---

## Recommended Next Steps

1. **Vor jedem echten Launch (CRITICAL):** Frontend-Checkout-UI bauen,
   Booking-Stornierung-Refund-Policy entscheiden und implementieren,
   echten E-Mail-Provider wählen und verdrahten, echte Stripe-Testmodus-
   Verifikation durchführen (`STRIPE_SANDBOX_RUNBOOK.md`), echte
   KI-Qualitätsevaluation durchführen (`AI_REAL_EVAL_RUNBOOK.md`),
   Legal/Tax-Review für Live-Zahlungen, Konto-Anonymisierung bauen.
2. **Vor Launch empfohlen (HIGH):** Redis-basiertes Rate Limiting,
   Consent-Architektur, Malware-Scan für Uploads, Request-/Correlation-ID,
   verifiziertes DB-Backup/PITR gegen die echte Produktions-Infrastruktur.
3. **Nach Launch planbar (MEDIUM):** `ParseUUIDPipe` global, globaler
   Exception-Filter, echte Cursor-Pagination statt der 200-Zeilen-Deckel,
   konsistentes Logging über alle Module, Retention-Policy für
   KI-Transkripte/Schreibeinreichungen.

---

## Absolute Rule — Bestätigung

Kein Testergebnis wurde erfunden. Keine Stripe-Zahlung wurde simuliert und
als erfolgreich dargestellt. Keine Claude-Antwort wurde fabriziert. Jeder
BLOCKED-Status ist ehrlich als BLOCKED markiert, nicht als PASSED
umdeklariert. Jeder Fund, der nicht eindeutig und sicher lösbar war, wurde
als offener Punkt dokumentiert statt improvisiert gelöst.

**PHASE 6.5 = PASS WITH RISK.**

Dann STOPP.
