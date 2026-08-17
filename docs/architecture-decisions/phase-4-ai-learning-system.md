# Phase 4 — AI Learning System: Architekturentscheidungen

Dokumentiert vor der Implementierung, wie gefordert. Status:
**Verifiziert vor Beginn:** Phase 3 (Learning Engine) ist vollständig
vorhanden — Prisma-Modelle `Level…UserVocabulary`, NestJS-Module
`levels/courses/lessons/exercises/progress/vocabulary`, Auth-Architektur
(`AuthGuard`/`RolesGuard`/`OwnershipGuard`/Service-Token), Entitlements
(`canAccess`/`PLAN_ENTITLEMENTS`) — und alle 115 Tests liefen grün
(85 API + 30 Web) vor Beginn dieser Phase.

---

## 1. AI-generierte Übungen sind ephemer, keine Curriculum-Zeilen

`Exercise`/`Question`/`Option` sind für **autorisierten** Lerninhalt
gebaut (feste Struktur, referenziert von `ExerciseAttempt` mit
Fremdschlüssel-Integrität). Eine KI-generierte Übertragungs-Übung dort
einzufügen, würde entweder die Curriculum-Tabellen mit Ad-hoc-Inhalten
verunreinigen oder eine parallele Fake-FK-Struktur erzwingen.

**Entscheidung:** KI-generierte Übungen werden **nicht** in
`Exercise`/`Question`/`Option` gespeichert. Sie sind Teil der
validierten AI-Response (`suggestedExercise`), leben nur in der
`ConversationMessage.metadata` bzw. der API-Response. Wird eine
KI-Übung vom Nutzer beantwortet, läuft die Bewertung über einen eigenen,
kleinen Endpunkt, der **nicht** `ExerciseAttempt` beschreibt, sondern
direkt `ProgressService.recordSkillAttempt(userId, skill, isCorrect)`
aufruft — dieselbe Methode, die Phase 3 für Skill-Scores aus echten
Lektionen nutzt. Das erfüllt die Kernregel „AI schlägt vor, Learning
Engine entscheidet“ (Abschnitt 26/30), ohne die Curriculum-Integrität zu
verwässern.

## 2. Provider: Anthropic Claude über Tool-Use für strukturierten Output

Freitext-JSON-Parsing aus einer LLM-Antwort ist unzuverlässig. Claude
unterstützt "Tool Use" (Function Calling): Man zwingt das Modell, mit
einem einzigen, klar typisierten Tool-Aufruf zu antworten, dessen Input
serverseitig gegen ein Zod-Schema validiert wird. **Entscheidung:** Jede
strukturierte AI-Antwort (Tutor, Korrektur, Übungsgenerierung) nutzt
Tool-Use, nie „bitte antworte als JSON“ im Freitext-Prompt. Schlägt die
Validierung fehl, wird ein kontrollierter Fallback zurückgegeben, nie
ungültiges JSON gespeichert (Abschnitt 7).

## 3. Kostenkontrolle: DB-gestützter Tageszähler, nicht In-Memory

Der In-Memory-Rate-Limiter aus Phase 2 (Login/Registrierung) ist für
kurze Missbrauchs-Fenster gedacht und übersteht keinen Neustart — für
eine **Kostengarantie** „FREE-Nutzer bekommen X AI-Nachrichten pro Tag“
reicht das nicht. **Entscheidung:** Ein neues, kleines Modell
`AiUsageRecord` (userId, feature, createdAt) zählt echte Nutzung
persistent; Limits pro `SubscriptionPlan` sind zentral in
`packages/types` (`AI_USAGE_LIMITS`) definiert, nie als verstreute
`if premium`-Checks. Der bestehende In-Memory-Limiter bleibt zusätzlich
für kurzfristigen Burst-Schutz (z. B. 5 Requests/Minute) im Einsatz —
zwei verschiedene Zwecke, zwei verschiedene, bewusst einfache Mechanismen.

## 4. Bestehende Entitlements werden wiederverwendet, keine neuen erfunden

`LIMITED_AI`, `AI_ADVANCED`, `WRITING_ADVANCED` existieren bereits seit
Phase 2 in `PLAN_ENTITLEMENTS` und wurden erkennbar für genau diese
Phase vorbereitet. **Entscheidung:** Keine neuen Entitlement-Keys.
FREE → `LIMITED_AI` (Basis-Tutor, Basis-Korrektur, enges Limit),
PREMIUM/PRO → zusätzlich `AI_ADVANCED`/`WRITING_ADVANCED` (tiefere
Analyse, höheres Limit). Prüfung ausschließlich über `canAccess()`.

## 5. `WritingSubmission.errors` als JSON, nicht relational

Im Gegensatz zu `Question`/`Option` (autorisierter Kerninhalt, muss
relational sauber sein) ist eine Fehlerliste aus einer KI-Korrektur
variabel geformtes, diagnostisches Ausgabe-Datum ohne eigenen
Lebenszyklus. **Entscheidung:** `WritingSubmission.errors Json` —
strukturiert durch das Zod-Schema auf Anwendungsebene, nicht durch
zusätzliche Tabellen. Vermeidet unnötige Tabellen für Daten, die nie
einzeln abgefragt werden.

## 6. Datenmodell-Ergänzung (minimal)

Neu: `ConversationSession`, `ConversationMessage` (role, content,
metadata `Json?` nur für strukturierte AI-Antwortteile),
`WritingSubmission`, `AiUsageRecord`. Keine weiteren Tabellen — insbesondere
keine eigene "Prompt"- oder "AI-Provider-Log"-Tabelle in der
Produktionsdatenbank (Observability läuft über strukturierte
Log-Ausgabe, siehe Abschnitt 27 der Aufgabenstellung, nicht über die DB).
