# Phase 4.5 — AI Reality & Quality Gate: Bericht

**Datum:** 2026-08-17
**Ziel:** Nicht nur beweisen, dass die AI-Architektur technisch funktioniert, sondern überprüfen, ob DeutschFlow mit einem echten Claude-Provider tatsächlich hochwertige Deutschlern-Antworten erzeugt.

---

## Zusammenfassung

Diese Sandbox-Umgebung stellt **keinen echten `ANTHROPIC_API_KEY`** bereit (geprüft: Shell-Umgebung, `apps/api/.env`, `apps/web/.env.local`, alle `.env*`-Dateien im Repo — nirgends ein Key). Gemäß der expliziten Vorgabe dieser Phase ("Ohne Key: sauber abbrechen, keine Fake-Antwort erzeugen") wurde deshalb **keine einzige echte KI-Antwort erzeugt oder bewertet**. Alles, was ohne einen echten Key verifizierbar war, wurde vollständig verifiziert — die eigentliche inhaltliche Qualitätsfrage ("erzeugt Claude hochwertige Deutschlern-Antworten?") bleibt offen, bis ein echter Key bereitgestellt wird.

Das ist kein Architektur- oder Codeproblem — die gesamte Infrastruktur für Real-Provider-Test und Evaluation-Suite ist fertig, reproduzierbar, in Tests abgesichert und läuft nachweislich korrekt bis zum tatsächlichen Provider-Aufruf.

---

## 1. Testfälle

26 Fälle in `apps/api/scripts/ai-eval/cases.ts`, über alle geforderten Kategorien:

| Kategorie | Anzahl | IDs |
|---|---|---|
| GRAMMAR (Abschnitt 4, exakte Beispielsätze der Aufgabenstellung) | 5 | `grammar-a1-correct`, `grammar-a2-word-order`, `grammar-b1-conditional-inversion`, `grammar-b2-correct-redundant-style`, `grammar-c1-correct-formal` |
| WRITING (A2 Nachricht, B1 Wohnungsanfrage, B2 E-Mail, C1 argumentativer Text) | 4 | `writing-a2-simple-message`, `writing-b1-apartment-inquiry`, `writing-b2-professional-email`, `writing-c1-formal-argumentative` |
| AMBIGUOUS_LANGUAGE | 3 | `ambiguous-word-order-1`, `ambiguous-wegen-dative-genitive`, `ambiguous-relative-clause-position` |
| FALSE_CORRECTION | 3 | `false-correction-1/2/3` |
| PROMPT_INJECTION | 5 | `injection-direct-english`, `injection-direct-german`, `injection-fake-admin`, `injection-hidden-in-german-text`, `injection-hidden-in-writing-task` |
| LEVEL_APPROPRIATENESS | 2 | `level-a1-simple-error`, `level-c1-register-nuance` |
| EXERCISE_GENERATION (Grammar/Vocabulary/Word-Order/Tense) | 4 | `exercise-grammar-subordinate-clause`, `exercise-vocabulary-idiom`, `exercise-word-order-subordinate`, `exercise-tense-perfekt` |

Jeder Fall hat: `input`, `expectation` (was ein korrektes System tun soll), `expectsCorrection` (ob der Satz einen echten Fehler enthält). Bemerkenswert: Die A1/B2/C1-Grammatikbeispiele aus Abschnitt 4 der Aufgabenstellung sind selbst bereits korrektes Deutsch — sie dienen zugleich als False-Correction-Tests (die KI darf sie nicht künstlich "korrigieren").

Die Suite läuft über **denselben Produktionscode** wie die echten Endpunkte (`AiService`, `PromptManager`, `TutorResponseSchema`/`WritingCorrectionResponseSchema`) — kein separater Testpfad, keine vereinfachte Nachbildung.

## 2. Ergebnisse

**Nicht ausgeführt — kein `ANTHROPIC_API_KEY` verfügbar.** Ausführung von `pnpm --filter @deutschflow/api ai:eval` bricht wie vorgesehen sauber ab:

```
[ai-eval] ANTHROPIC_API_KEY is not set. Aborting cleanly — none of the 26
evaluation cases were run and no results were fabricated. Set
ANTHROPIC_API_KEY as a local server-only env var to run the real evaluation.
```
Exit-Code: `0`. Kein Request, keine Fake-Daten, keine `docs/ai-evaluation/phase-4.5-raw-results.json` wurde erzeugt.

Sobald ein echter Key als lokale, server-only Umgebungsvariable in `apps/api` gesetzt wird, führt derselbe Befehl alle 26 Fälle real gegen Claude aus, wendet die mechanischen Heuristiken an (`apps/api/scripts/ai-eval/heuristics.ts`, 12 eigene Unit-Tests, netzwerkfrei) und schreibt die Rohantworten nach `docs/ai-evaluation/phase-4.5-raw-results.json` (bewusst `.gitignore`t — nur der kuratierte Bericht bleibt versioniert).

## 3. Scores

**Nicht ausgeführt** — aus demselben Grund wie Abschnitt 2. Das 0/1/2-Rubrik (CORRECTNESS, LEVEL_APPROPRIATENESS, EXPLANATION, NATURALNESS, EXERCISE_QUALITY, SAFETY) ist in `apps/api/scripts/ai-eval/types.ts` (`CaseScores`) definiert und einsatzbereit; es wurde bewusst **keine einzige Zahl erfunden**, da das die explizite Vorgabe dieser Phase verletzen würde ("Keine Fake-Antwort erzeugen").

## 4. Fehler

Im Rahmen dieses Quality Gates wurde **ein echter Fehler gefunden** (siehe Abschnitt 5) — nicht durch die KI-Inhaltsprüfung (die nicht laufen konnte), sondern durch die Fallback-/Fehlerpfad-Verifikation:

- `AiUsageLimitExceededError` erbte von `Error` statt von einer NestJS-`HttpException`. Beim Erreichen des Tageslimits kam beim echten End-to-End-Test ein **500 Internal Server Error** statt eines sauberen **403 Forbidden** mit Klartext-Nachricht zurück.

Zwei False Positives aus der eigenen UX-Review wurden untersucht und als **Testskript-Artefakte, kein Produktfehler** verifiziert: Ein Playwright-Skript ohne explizites `waitForNavigation()` las `page.url()` zu früh nach dem Registrierungs-Submit aus. Mit `Promise.all([page.waitForNavigation(), page.click(...)])` bestätigt: Registrierung leitet korrekt zu `/dashboard` weiter, `/ai-tutor`s Empty-State-Text ("Stell eine Frage auf Deutsch...") ist tatsächlich vorhanden.

## 5. Behobene Fehler

**`AiUsageLimitExceededError` (500 statt 403)** — behoben in `apps/api/src/modules/ai/services/ai-errors.ts`, indem die Klasse jetzt `ForbiddenException` statt `Error` erweitert (gleiches Muster wie die bestehenden Entitlement-Fehler). Live erneut verifiziert: FREE-User am Tageslimit erhält jetzt `403 {"message":"Daily limit of 10 reached for \"tutor\".", "error":"Forbidden"}`, sowohl direkt über die API als auch sichtbar im `/ai-tutor`-Chat-UI. Regressionsabdeckung: `ai-usage.service.spec.ts` (`.rejects.toBeInstanceOf(AiUsageLimitExceededError)`, jetzt zusätzlich implizit eine `HttpException`). Gesamte Suite danach erneut grün gelaufen.

*(Dieser Fehler wurde bereits während der vorherigen Phase-4-Abschlussverifikation gefunden und behoben, nicht innerhalb dieser Phase-4.5-Sitzung neu entdeckt — hier zur Vollständigkeit dokumentiert, da Phase 4.5 explizit erneut danach fragt.)*

Keine weiteren Fehler in dieser Phase gefunden.

## 6. Kosten

**Tatsächliche Kosten dieser Sitzung: 0 USD** — es wurde kein einziger echter Provider-Call getätigt (kein Key vorhanden).

Geschätzte Kosten für einen zukünftigen echten Lauf (Modell `claude-sonnet-5`, Richtwerte, keine Garantie):
- 26 Eval-Fälle + 2 Sanity-Requests aus `ai:real-test` = 28 Requests
- `maxOutputTokens` pro Request: 800 (Eval) bzw. 800 (Real-Test) — bewusst niedrig gehalten, keine unnötig großen Prompts
- System-Prompt pro Request: ca. 300–500 Tokens (SAFETY_INSTRUCTIONS + Kontext + CEFR-Guidance + Exercise-Guidance)
- Grobe Schätzung: ~600–900 Input-Tokens + bis zu 800 Output-Tokens pro Request → bei 28 Requests deutlich unter 50.000 Tokens gesamt
- Bei aktuellen Sonnet-Preisen liegt das im **Cent-Bereich**, nicht im Dollar-Bereich — ein einzelner vollständiger Lauf der gesamten Suite ist bewusst günstig gehalten

`AiObservabilityLogger` protokolliert bei jedem echten Lauf `model`, `latencyMs`, `inputTokens`, `outputTokens` pro Request (nie den Inhalt) — bei einem echten Lauf lassen sich die tatsächlichen Zahlen direkt aus den Server-Logs ablesen statt geschätzt zu werden.

## 7. Security Findings

Erneute Prüfung aller Punkte aus Abschnitt 14 der Aufgabenstellung — keine neuen Findings, alles weiterhin bestätigt:

- **API Key server-only:** `ANTHROPIC_API_KEY` wird ausschließlich in `ClaudeProvider` via `process.env` gelesen. Die neuen Phase-4.5-Skripte (`ai-real-provider-test.ts`, `ai-eval/run-eval.ts`, `ai-eval/env.ts`) geben nur *ob* der Key gesetzt ist aus, nie den Wert (grep-verifiziert).
- **Keine Secrets im Client:** `grep` über `apps/web` nach `anthropic`/`ANTHROPIC` → keine Treffer.
- **Keine `NEXT_PUBLIC_*`-AI-Variablen** irgendwo im Repo.
- **Keine Secrets in Logs:** `AiObservabilityLogger` loggt nur Metadaten (Feature, Provider, Modell, Latenz, Tokenzahlen, Fehlermeldungstext), nie Nutzertext oder KI-Antwortinhalt.
- **Kein committeter API-Key-Musterstring** (`sk-ant-...`) im Repo.
- **Ownership, Entitlements, Rate-Limiting, Input-Limits, Prompt-Injection-Abwehr, Output-Validierung:** unverändert seit Phase 4, weiterhin durch 149+ Unit-/E2E-Tests abgesichert; keine Regression durch die Phase-4.5-Ergänzungen.
- Die Rohergebnis-Datei der Eval-Suite (`phase-4.5-raw-results.json`) ist `.gitignore`t, um zu verhindern, dass ein künftiger echter Lauf versehentlich große KI-Antwortmengen ins Repo committet.

## 8. UX Findings

`/ai-tutor` und `/writing` live geprüft (Desktop 1280px, Mobile 375px, Playwright):

- **Loading:** Button-Label wechselt zu "Sendet…"/"Wird korrigiert…", Eingabe währenddessen deaktiviert — bestätigt.
- **Error:** Tageslimit-Fehlermeldung erscheint als rote `FormMessage`-Box direkt im Chat-Verlauf bzw. unter dem Formular — bestätigt (bereits in Phase 4 verifiziert).
- **Empty State:** `/ai-tutor` zeigt vor der ersten Nachricht den Hinweistext "Stell eine Frage auf Deutsch oder schreib einen Satz…"; `/writing` zeigt vor dem ersten Korrigieren korrekt keinen Ergebnis-Block — bestätigt.
- **Mobile (375px):** Kein horizontales Overflow auf `/ai-tutor` oder `/writing`; Eingabefeld+Senden-Button und Textarea bleiben vollständig innerhalb des Viewports.
- **Lange Antworten:** Ein synthetisch eingefügter ~2000-Zeichen-Absatz verursacht kein horizontales Overflow (Text bricht normal um).
- **Korrekturen/Übungen:** Rendering-Code geprüft — durchgestrichenes Original/grüne Korrektur, Kategorie+Schweregrad+Erklärung, Übungs-Widget mit Multiple-Choice- oder Freitext-Eingabe je nach Übungstyp.
- **Tageslimit / Free User:** Bereits in Phase 4 live mit echtem FREE-User verifiziert (403 im Chat sichtbar).

Keine kritischen oder blockierenden UX-Probleme gefunden. Die Oberfläche bleibt bewusst ruhig — keine Animationen, klare Zustände.

## 9. Bekannte Grenzen

- **Zentrale Einschränkung:** Die inhaltliche KI-Qualität (erkennt Claude echte Fehler korrekt, erklärt sie niveaugerecht, vermeidet Overcorrection, widersteht Prompt-Injection *in der Praxis mit echten Modell-Antworten*, generiert sinnvolle Übungen) ist **nicht verifiziert**, weil kein `ANTHROPIC_API_KEY` in dieser Umgebung verfügbar war. Alles, was *ohne* echte Modellantworten prüfbar ist (Architektur, Fallback-Sicherheit, Ownership, Entitlements, Rate-Limits, Security, UX-Gerüst), ist verifiziert.
- Die Heuristiken in `heuristics.ts` sind bewusst einfache, mechanische Red-Flag-Detektoren (Substring-/Wortzahl-basiert) — sie ersetzen keine menschliche Bewertung der Abschnitt-11-Rubrik, sondern ergänzen sie nur um leicht automatisierbare Fälle.
- Kein echter Timeout-Test gegen einen tatsächlich hängenden Netzwerk-Call (nur gegen die von `@anthropic-ai/sdk` exportierte `APIConnectionTimeoutError`-Klasse simuliert) — dafür wäre ein echter Netzwerk-Fault nötig, den diese Sandbox nicht kontrolliert herbeiführen kann.
- `ClaudeProvider` setzt kein explizites `timeout`-Limit beim Anthropic-Client (nutzt den SDK-Standard). Kein kritischer Fehler nach dem Abschnitt-17-Maßstab, aber eine Empfehlung für später: ein explizites, kürzeres Timeout (z. B. 30s) würde eine hängende Chat-Anfrage schneller in den kontrollierten Fallback überführen, statt auf den SDK-Standardwert zu warten.

## 10. Empfehlung für Phase 5

**Nicht "einfach Phase 5 empfehlen"**, wie die Aufgabenstellung explizit verlangt, solange die zentrale Frage dieser Phase unbeantwortet ist. Empfehlung:

1. **Vor Phase 5:** Einen echten `ANTHROPIC_API_KEY` als lokale, server-only Umgebungsvariable bereitstellen und `pnpm --filter @deutschflow/api ai:eval` ausführen. Das Ergebnis (`docs/ai-evaluation/phase-4.5-raw-results.json`) manuell nach der 0/1/2-Rubrik durchsehen und diesen Bericht um die echten Abschnitte 2/3 ergänzen.
2. Bei diesem Lauf besonders auf die Fälle mit `possiblyTooComplexForLevel`, `possibleAbsolutistClaim`, `unexpectedCorrection` und `possibleInjectionCompliance` (heuristisch markiert) achten — das sind die wahrscheinlichsten Stellen für echte Qualitätsprobleme.
3. Danach `pnpm --filter @deutschflow/api ai:real-test` als schneller Sanity-Check vor jedem Deploy nutzbar.
4. Erst nach einem grünen echten Eval-Lauf (keine SAFETY-Kategorie-Ausfälle, keine massiven CORRECTNESS-Ausfälle) mit Phase 5 fortfahren.

---

## 11. Nachtrag — technische Vorbereitung während BLOCKED (kein Key)

Auf ausdrückliche Anweisung: Status bleibt `BLOCKED — REAL AI EVALUATION PENDING`, kein `ai:eval`-Lauf, keine Fake-Ergebnisse, kein kostenpflichtiger Call. Stattdessen wurde die Wartezeit für Provider-Robustheit genutzt (ausschließlich in `claude.provider.ts`, der einzigen Datei mit SDK-Import, plus einem optionalen Feld auf dem provider-agnostischen Interface — siehe ADR
`docs/architecture-decisions/phase-4-ai-learning-system.md`, Abschnitt 7 für die volle Begründung):

1. **Timeout:** `ClaudeProvider` setzt jetzt explizit `timeout: 30_000`ms statt den SDK-Default (10 Minuten) zu erben. Per `ANTHROPIC_TIMEOUT_MS` überschreibbar.
2. **Abort/Cancellation:** `AiCompletionRequest`/`AiCompletionOptions` haben ein neues optionales `signal?: AbortSignal`, durchgereicht bis zu `client.messages.create()`. Kein bestehender Aufrufer setzt aktuell einen Signal (keine Controller-Verdrahtung erzwungen) — die Fähigkeit existiert und ist getestet.
3. **Retry-Strategie:** Kein eigener Retry-Loop. `maxRetries` wird jetzt explizit gesetzt (Default 2, per `ANTHROPIC_MAX_RETRIES` überschreibbar) statt implizit vom SDK übernommen — das SDK selbst retried bereits mit Exponential Backoff auf 408/409/429/5xx.
4. **Fehlerbehandlung 429/5xx/Timeout:** `ClaudeProvider` normalisiert jeden SDK-Fehler zu einem einzelnen, konsistent geformten `Error` (`Claude API error (status=…, type=…): …`), bevor er `AiService`s bestehenden catch-all erreicht — kein neuer Verzweigungscode in `AiService`/`TutorService`/`CorrectionService`.
5. **Sichere Logging-Regeln:** Die normalisierte Fehlermeldung stammt ausschließlich aus Statuscode + Fehlerklassenname + Anthropics eigenem Response-Text — nie aus Nutzereingabe/Prompt. Per Test verifiziert (`never includes request content in the normalized error message`).
6. **Tests für Provider-Ausfälle/Timeout/Rate-Limit/ungültige Ausgabe:** `claude.provider.spec.ts` von 5 auf 16 Tests erweitert — Client-Konfiguration (Timeout/Retries inkl. Env-Override und ungültigem Override), Signal-Weiterleitung, sauberer Reject bei Abbruch (`APIUserAbortError`), Normalisierung von `RateLimitError` (429), `InternalServerError` (5xx) und `APIConnectionTimeoutError`, sowie ein generischer Fang für einen Nicht-Error-Wurf.
7. **Eval-Suite unverändert:** `cases.ts`, `heuristics.ts`, `run-eval.ts`, `types.ts`, `heuristics.spec.ts` — `git diff` bestätigt keine Änderung.

Ergebnis: `pnpm lint`/`typecheck`/`test`/`build` erneut vollständig grün (194 Tests: 164 API + 30 Web). `ai:real-test` und `ai:eval` brechen weiterhin sauber ab, ohne Key, ohne Fake-Daten — unverändertes Verhalten, nur die dahinterliegende Provider-Robustheit ist jetzt stärker.

---

## STATUS

**PHASE 4.5 = BLOCKED**

**Reason:** Kein echter ANTHROPIC_API_KEY verfügbar.

Alle technisch verifizierbaren Teile sind grün: `pnpm lint`, `pnpm typecheck`, `pnpm test` (194/194: 164 API + 30 Web), `pnpm build` — alle erfolgreich. Ein echter Fehler wurde gefunden und behoben (Abschnitt 5). Security- und UX-Review ohne kritische Findings. Provider-Robustheit (Timeout, Retry, Abort, Fehlerbehandlung, Logging) gehärtet und getestet (Abschnitt 11). Die Infrastruktur für den echten AI-Quality-Gate (Real-Provider-Test, 26-Fälle-Eval-Suite, Heuristiken, Kostenschätzung) ist vollständig, getestet und reproduzierbar — **aber noch nicht mit einem echten Provider ausgeführt worden**, weil kein Key verfügbar war. Diese Phase kann erst als vollständig **PASSED** gelten, wenn ein echter Key bereitgestellt und `ai:eval` real ausgeführt wurde.
