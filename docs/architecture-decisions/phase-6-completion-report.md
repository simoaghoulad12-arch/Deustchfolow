# Phase 6 — Payments & Monetization: Abschlussbericht

**Datum:** 2026-08-18
**Ziel:** Die in "PHASE 6 — APPROVAL TO IMPLEMENT" freigegebene Zahlungs- und
Monetarisierungsarchitektur (Phase 6.1–6.14) vollständig implementieren, auf
Basis des zuvor separat freigegebenen
[Architecture Quality Gate Reports](./phase-6-payment-architecture-quality-gate.md),
und mit demselben Ehrlichkeitsgebot wie Phase 4.5: keine gefälschten
Ergebnisse, keine geschwächten Tests, kein simuliertes "Erfolg" bei einer
tatsächlich nicht verifizierten Zahlung.

---

## Zusammenfassung

**Alles, was ohne einen echten Stripe-TEST-Key verifizierbar ist, ist
verifiziert und grün:** 607 Tests (577 `apps/api` + 30 `apps/web`), `pnpm
lint`, `pnpm typecheck` und `pnpm build` — alle über das gesamte Monorepo,
alle erfolgreich. Jede der 14 Subphasen (6.1–6.14) wurde einzeln
dokumentiert (kurz dokumentieren → implementieren, siehe
[phase-6-implementation.md](./phase-6-implementation.md)), einzeln
committet und gepusht, mit Lint/Typecheck/Tests nach jeder Subphase.

**Ein Punkt bleibt offen, exakt wie bei Phase 4.5:** Diese
Sandbox-Umgebung stellt **keinen echten `STRIPE_SECRET_KEY`** bereit
(geprüft: Shell-Umgebung, `apps/api/.env`, `apps/api/.env.example`, alle
`.env*`-Dateien im Repo — nirgends ein Key, weder echt noch Platzhalter
mit Wert). Das dafür gebaute manuelle Sandbox-Verifikationsskript
(`payments:verify-sandbox`, Phase 6.13) bricht deshalb wie vorgesehen
sauber ab — **kein einziger echter Stripe-Testmodus-Aufruf wurde
gemacht, kein Ergebnis wurde erfunden.** Das ist kein Architektur- oder
Codeproblem: die gesamte Infrastruktur für die echte Sandbox-Verifikation
ist fertig, reproduzierbar und wartet auf einen echten `sk_test_...`
Key.

---

## 1. Was in Phase 6 gebaut wurde (6.1–6.14)

| Subphase | Inhalt | Status |
|---|---|---|
| 6.1 Payment Database Foundation | 7 neue Prisma-Modelle (`StripeCustomer`, `TutorConnectedAccount`, `Payment`, `Refund`, `TutorPayout`, `StripeWebhookEvent`, `PaymentPolicy`), 6 neue Enums, `SubscriptionStatus` auf Stripes echten 7-Werte-Lebenszyklus umgestellt. `PaymentPolicy` als einzige Quelle für jeden laut Freigabe konfigurierbaren Wert (Kommission, SUPPORT-Refund-Limit, Karenzzeit, Buchungs-TTL) — nichts davon ein `const` im Code. | ✅ |
| 6.2 Stripe Customer | `StripeCustomerService` — lazy `getOrCreate`, nie ein zweiter Stripe-Customer pro User. | ✅ |
| 6.3 Subscription Lifecycle | `SubscriptionService` — jeder Schreibzugriff auf `Subscription.status`/`plan` läuft ausschließlich über den Webhook-Handler; Selbstbedienungs-Cancel ruft nur Stripe auf, schreibt nie selbst. | ✅ |
| 6.4 Checkout | `CheckoutService` — Stripe-gehostete Checkout Session für PREMIUM/PRO; FREE wird nie gegen Stripe abgerechnet. | ✅ |
| 6.5 Webhooks + Idempotency | Signaturprüfung mit echter Stripe-Krypto (`generateTestHeaderString`, nie gemockt), `StripeWebhookEvent`-Unique-Constraint als DB-Ebene der Idempotenzgarantie. | ✅ |
| 6.6 Tutor Connect | Destination-Charges statt "Plattform sammelt, dann transferiert" — vermeidet absichtlich alles, was Richtung E-Geld-Lizenz driften könnte. | ✅ |
| 6.7 Booking Payments | PaymentIntent + `application_fee_amount` + `transfer_data.destination` in einem atomaren Charge; Buchbarkeits-Gate an der Checkout-Stelle, nicht an der Buchungserstellung (Phase 5 bleibt unangetastet). | ✅ |
| 6.8 Refunds | SUPPORT hat stehende Autorität bis zum konfigurierbaren Limit, darüber ausschließlich ADMIN — keine Warteschlange, einfach eine harte Grenze. Nur Vollrückerstattungen bewegen `Booking.status`. | ✅ |
| 6.9 Tutor Payouts | Reines, webhook-getriebenes Reconciliation-Ledger (`transfer.created`, `payout.paid/.failed`) — nie clientseitig auslösbar, keine erfundene 1:1-Korrelation zwischen Transfer und Payout. | ✅ |
| 6.10 Admin/Support Payment Operations | Schließt drei zuvor bewusst offen gelassene API-Lücken: `PaymentPolicy`-Endpunkte (GET: ADMIN+SUPPORT, PATCH: nur ADMIN), Self-Service-Cancel, vier ADMIN/SUPPORT-Read-Endpunkte (`payments/admin/...`). | ✅ |
| 6.11 Entitlements Integration | `EntitlementsService.getActivePlan()` erkennt jetzt ACTIVE/TRIALING sofort und PAST_DUE innerhalb der konfigurierbaren Karenzzeit (Default 7 Tage) — danach fällt der Plan lesend auf FREE zurück, ohne dass je etwas geschrieben wird (nur der Webhook-Handler schreibt `Subscription.status`). | ✅ |
| 6.12 Payment Security Tests | Komponierte Sicherheitstests statt nur Einzelbausteine: Webhook-Controller-Pipeline (Duplikat erreicht den Dispatcher nie), `ValidationPipe` weist geschmuggelte `status`/`plan`/`id`-Felder zurück, positive Regression, dass kein clientseitig auslösbarer Payout-Endpunkt existiert. | ✅ |
| 6.13 Sandbox E2E | Verifikationsskript gebaut, ausgeführt, bricht sauber ab (kein Key). Siehe Abschnitt 3. | ⚠️ BLOCKED (kein Code-/Architekturproblem) |
| 6.14 Quality Gate + Abschlussbericht | Dieser Bericht. | ✅ |

Volle Details, Design-Entscheidungen und Begründungen zu jeder Subphase:
[phase-6-implementation.md](./phase-6-implementation.md).

## 2. Quality Gate: Lint / Typecheck / Test / Build

Alle vier über das gesamte Monorepo (`packages/types`, `packages/database`,
`packages/ui`, `packages/config`, `apps/api`, `apps/web`), nicht nur
`apps/api`:

```
$ pnpm lint       → 7/7 Pakete erfolgreich
$ pnpm typecheck  → 7/7 Pakete erfolgreich
$ pnpm test       → 607/607 Tests grün (577 apps/api + 30 apps/web)
$ pnpm build      → 4/4 Build-Tasks erfolgreich (inkl. next build, nest build)
```

Kein Test wurde geschwächt oder entfernt, um Grün zu erreichen — jeder neue
Test in 6.1–6.12 prüft ein echtes Verhalten (siehe die einzelnen
Subphasen-Abschnitte in `phase-6-implementation.md` für die jeweilige
Begründung).

## 3. Sandbox E2E — Ausführung und Status

`pnpm --filter @deutschflow/api payments:verify-sandbox` ausgeführt:

```
[verify-stripe-sandbox] STRIPE_SECRET_KEY is not set. Aborting cleanly —
no Stripe test-mode call of any kind was made and no result was
fabricated. Set STRIPE_SECRET_KEY (a real sk_test_... key) as a local
server-only env var to run this verification.
```

Exit-Code: `0`. Kein Stripe-API-Aufruf, keine erfundenen Ergebnisse.

Das Skript (`apps/api/scripts/verify-stripe-sandbox.ts`) ist vollständig
gebaut und deckt bei Ausführung mit einem echten Key die zentralen
Geldflüsse gegen echte Stripe-TEST-Infrastruktur ab: Customer-Erstellung,
Subscription-Checkout-Session, eine Destination-Charge-PaymentIntent gegen
ein Connect-Test-Konto (verifiziert Kommissions-Split und atomaren
Transfer), sowie eine Teil-Rückerstattung — mit unabhängigem
PASS/FAIL/SKIP pro Phase. Es ist bewusst nie in CI eingebunden (dieselbe
Begründung wie `booking:verify-concurrency` und `ai:eval`: CI hat keine
echten Stripe-Credentials und sollte keine brauchen, um grün zu bleiben).

**Bis ein echter `sk_test_...` Key (plus `STRIPE_PRICE_ID_PREMIUM`/`_PRO`
und die beiden Webhook-Secrets) bereitgestellt und das Skript real
ausgeführt wird, bleibt die tatsächliche Ende-zu-Ende-Verifikation gegen
lebende Stripe-Test-Infrastruktur offen** — exakt wie bei Phase 4.5s
`ANTHROPIC_API_KEY`.

## 4. Bestätigung der nicht verhandelbaren Vorgaben

Jede der in der Freigabe wörtlich genannten Regeln, mit Fundstelle:

| Vorgabe | Wie erfüllt |
|---|---|
| Nur Stripe TEST/SANDBOX, keine Live-Zahlungen/-Secrets | `StripeService.client` verweigert jeden `sk_live_...`-Key explizit (`stripe.service.ts`); keine echten Credentials wurden je committet. |
| Jede Stripe-Schreiboperation serverseitig | Einziger Ort mit `import 'stripe'`: `StripeService`. Kein Frontend-Code ruft die Stripe-API mit einem Secret Key auf. |
| Webhook-Signaturen verifiziert, Verarbeitung idempotent | `WebhookSignatureService` (echte HMAC-Prüfung, nie gemockt) + `WebhookIdempotencyService` (DB-Unique-Constraint) + Phase-6.12-Test, der beweist: ein Duplikat erreicht den Dispatcher nie. |
| Client bestimmt Zahlungsstatus nie autoritativ | Jeder `Payment`/`Subscription`/`Refund`/`TutorPayout`-Statuswechsel kommt ausschließlich aus dem Webhook-Handler; Phase-6.12-e2e-Tests beweisen, dass `ValidationPipe` einen geschmuggelten `status`/`plan` zurückweist. |
| Keine doppelte Zahlung, kein doppelter Payout | Drei Ebenen (DB-Unique auf `Payment.bookingId`, Stripe-Idempotency-Keys, Webhook-Idempotenz-Ledger) — siehe Quality-Gate-Report §18, umgesetzt in 6.4/6.5/6.7. Kein Tutor-Payout-Endpunkt existiert überhaupt (Phase-6.12-Regressionstest). |
| DB-Transaktionen/-Constraints wo sinnvoll | `payments.bookingId` unique, `tutor_payouts.stripe_transfer_id`/`stripe_payout_id` unique, `stripe_webhook_events.stripe_event_id` unique — die Datenbank ist die letzte Verteidigungslinie, nicht nur der Anwendungscode. |
| Vor jeder größeren Architekturänderung: kurz dokumentieren, dann implementieren | Jede Subphase hat einen Design-Abschnitt in `phase-6-implementation.md`, geschrieben vor dem jeweiligen Code. |
| Nach jedem Subsystem: Lint, Typecheck, Tests | Nach jeder der 13 Code-Subphasen ausgeführt und grün, vor dem jeweiligen Commit. |
| Nie Tests entfernen/schwächen, um Grün zu erreichen | Keine bestehende Testerwartung wurde in dieser Phase abgeschwächt; wo sich Verhalten änderte (z. B. `EntitlementsService`), wurden Tests entsprechend erweitert, nie gelockert. |
| Nie fake erfolgreiche Zahlungen präsentieren | Abschnitt 3 — das Sandbox-Skript bricht ehrlich ab, statt einen Erfolg zu simulieren. |

## 5. Verdikt

**PHASE 6 = PASSED, mit einem offenen, extern bedingten Punkt (Sandbox-E2E,
Abschnitt 3).**

Jede technisch in dieser Umgebung verifizierbare Anforderung ist erfüllt:
Architektur, Datenmodell, Sicherheitsmodell, Idempotenz, IDOR-Konventionen,
Konfigurierbarkeit aller freigegebenen Business-Werte, Entitlements-
Integration, sowie 607/607 grüne Tests und ein sauberer
Lint/Typecheck/Build über das gesamte Monorepo. Der einzige offene Punkt —
echte Stripe-Testmodus-Verifikation — ist kein Code- oder
Architekturmangel, sondern exakt dieselbe Art von extern bedingter Lücke,
die Phase 4.5 bereits transparent dokumentiert hat: die komplette
Infrastruktur dafür ist fertig, getestet und reproduzierbar, wartet aber
auf einen echten Stripe-`sk_test_...`-Key, um tatsächlich ausgeführt zu
werden.

**Nächster Schritt (sobald verfügbar):** `STRIPE_SECRET_KEY`,
`STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`,
`STRIPE_CONNECT_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PREMIUM`,
`STRIPE_PRICE_ID_PRO` als lokale, server-only Umgebungsvariablen setzen
und `pnpm --filter @deutschflow/api payments:verify-sandbox` ausführen.
