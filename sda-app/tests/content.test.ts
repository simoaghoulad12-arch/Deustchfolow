/**
 * Vollständigkeit der Inhalte aus legacy/index.html (Phase 1).
 * Nichts darf verloren gehen: die Zahlen hier stammen aus CLAUDE.md und docs/CONTENT-STATUS.md.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { allLessons, content, LABELS, LEVEL_KEYS } from '../content';
import { extractContent, type ExtractedContent } from '../scripts/extract';
import { LEGACY_PATH, loadLegacy } from '../scripts/legacy-runtime';

const lessons = allLessons();
const levels = content.curriculum.levels;
const modules = levels.flatMap((l) => l.modules);

describe('legacy/index.html', () => {
  it('ist unverändert (legacy/ niemals ändern)', () => {
    const hash = createHash('sha256').update(readFileSync(LEGACY_PATH)).digest('hex');
    expect(hash).toBe('ec15302138dfd8e1c4237e2b20571776c63a26219e3f51658f068ab63187b953');
  });
});

describe('Curriculum', () => {
  it('hat 4 Level A1–B2', () => {
    expect(levels.map((l) => l.key)).toEqual([...LEVEL_KEYS]);
    for (const l of levels) {
      expect(l.name).not.toBe('');
      expect(l.goal).not.toBe('');
    }
  });

  it('hat 36 Module (8, 8, 10, 10)', () => {
    expect(levels.map((l) => l.modules.length)).toEqual([8, 8, 10, 10]);
    expect(modules).toHaveLength(36);
    for (const m of modules) expect(m.title).not.toBe('');
  });

  it('hat 144 Grammatikstunden mit Titel und Kernpunkten', () => {
    const topics = modules.flatMap((m) => m.grammar);
    expect(topics).toHaveLength(144);
    for (const t of topics) {
      expect(t.title).not.toBe('');
      expect(t.kern.length).toBeGreaterThan(0);
    }
    expect(lessons.filter((l) => l.type === 'g')).toHaveLength(144);
  });

  it('hat 72 Sprechstunden (Fr und Sa pro Modul)', () => {
    const speak = lessons.filter((l) => l.type === 's');
    expect(speak).toHaveLength(72);
    expect(new Set(speak.map((l) => l.day))).toEqual(new Set(['Fr', 'Sa']));
    for (const m of modules) expect(m.speaking.thema).not.toBe('');
  });

  it('hat Lernziele für jedes der 36 Module', () => {
    for (const m of modules) expect(content.objectives[m.id]?.length, m.id).toBeGreaterThan(0);
    expect(Object.keys(content.objectives)).toHaveLength(36);
  });
});

describe('Skripte und Sprechdialoge', () => {
  it('hat 64 vollständige Vorlese-Skripte (A1, A2) mit Darija-Hinweis, 4 Übungen und Hausaufgabe', () => {
    expect(content.scripts).toHaveLength(64);
    for (const k of ['A1', 'A2'])
      expect(content.scripts.filter((s) => s.lessonId.startsWith(k + '.'))).toHaveLength(32);
    for (const s of content.scripts) {
      expect(s.lines.length, s.lessonId).toBeGreaterThan(0);
      expect(s.darija, s.lessonId).not.toBe('');
      expect(s.exercises, s.lessonId).toHaveLength(4);
      for (const e of s.exercises) {
        expect(e.frage).not.toBe('');
        expect(e.loesung).not.toBe('');
      }
      expect(s.hausaufgabe, s.lessonId).not.toBe('');
    }
  });

  it('hat 256 Übungen mit Lösungen (128 pro Level A1, A2)', () => {
    expect(content.scripts.flatMap((s) => s.exercises)).toHaveLength(256);
  });

  it('jedes Skript gehört zu einer bestehenden Grammatikstunde', () => {
    const ids = new Set(lessons.filter((l) => l.type === 'g').map((l) => l.id));
    for (const s of content.scripts) expect(ids.has(s.lessonId), s.lessonId).toBe(true);
  });

  it('hat 16 Sprechdialoge mit Fragekarten', () => {
    expect(content.speaking).toHaveLength(16);
    for (const d of content.speaking) {
      expect(d.dialog.length).toBeGreaterThan(1);
      expect(d.karten.length).toBeGreaterThan(0);
    }
  });
});

describe('Online-Leitfaden und Betrieb', () => {
  it('hat 18 Aktivitäten, 7 WhatsApp-Vorlagen, 9 Plattformen, 6 Standards, 10 Notfälle', () => {
    expect(content.activities).toHaveLength(18);
    expect(content.templates).toHaveLength(7);
    expect(content.platforms).toHaveLength(9);
    expect(content.standards).toHaveLength(6);
    expect(content.emergency).toHaveLength(10);
    for (const a of content.activities) expect(a.ablauf.length).toBeGreaterThan(0);
    for (const t of content.templates) expect(t.text).not.toBe('');
  });

  it('hat das Probestunden-Skript mit 6 Abschnitten', () => {
    expect(content.probe).toHaveLength(6);
    for (const p of content.probe) expect(p.lines.length).toBeGreaterThan(0);
  });

  it('Germany Preparation verweist nur auf bestehende Stunden', () => {
    expect(content.germany).toHaveLength(9);
    const ids = new Set(lessons.map((l) => l.id));
    for (const g of content.germany)
      for (const id of g.lessonIds) expect(ids.has(id), id).toBe(true);
  });

  it('Wochenroutine des Teams aus dem Leitfaden (Mo bis So)', () => {
    expect(content.weeklyRoutine.map((r) => r.tag)).toEqual([
      'Montag',
      'Di bis Do',
      'Freitag',
      'Samstag',
      'Sonntag',
    ]);
    expect(content.pages.guide?.length).toBeGreaterThan(10);
  });

  it('Lesson System hat 9 Schritte mit Minuten und Kennzeichnung', () => {
    expect(content.lessonSystem.map((s) => s.nr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const s of content.lessonSystem) expect(s.labels.length).toBeGreaterThan(0);
  });
});

describe('Vorlese-Skripte', () => {
  it('jede Grammatik-, Sprech- und Teststunde hat ein Skript, dazu die Probestunde', () => {
    for (const l of lessons.filter((x) => x.type !== 'x')) {
      expect(content.readouts[l.id]?.length, l.id).toBeGreaterThan(0);
    }
    expect(content.readouts['probe.ps']).toHaveLength(6);
    expect(Object.keys(content.readouts)).toHaveLength(252 + 1);
  });

  it('A1/A2-Grammatikskripte enthalten Text, Darija-Hinweis und die 4 Übungen mit Lösung', () => {
    for (const s of content.scripts) {
      const blocks = (content.readouts[s.lessonId] ?? []).flatMap((x) => x.blocks);
      expect(
        blocks.some((b) => b.type === 'darija' && b.text === s.darija),
        s.lessonId,
      ).toBe(true);
      const own = blocks
        .filter((b) => b.type === 'exercises')
        .slice(-3)
        .flatMap((b) => (b.type === 'exercises' ? b.items : []));
      expect(own, s.lessonId).toEqual(s.exercises);
    }
  });

  it('jeder Abschnitt hat Zeit und Titel auf Deutsch und Arabisch', () => {
    for (const [id, sections] of Object.entries(content.readouts)) {
      for (const s of sections) {
        expect(s.zeit, id).not.toBe('');
        expect(s.titel.de, id).not.toBe('');
        expect(s.titel.ar, id).not.toBe('');
      }
    }
  });
});

describe('Bereiche (Filter)', () => {
  it('jede Unterrichtsstunde hat mindestens einen Bereich', () => {
    for (const l of lessons.filter((x) => x.type !== 'x'))
      expect(l.areas.length, l.id).toBeGreaterThan(0);
    expect(lessons.some((l) => l.areas.includes('Deutschland'))).toBe(true);
    expect(lessons.some((l) => l.areas.includes('Bewerbung'))).toBe(true);
  });
});

describe('Checklisten', () => {
  it('hat alle Stunden: 4 Level-Starts + 36 Wochen × 7 Tage', () => {
    expect(lessons).toHaveLength(4 + 36 * 7);
    expect(lessons.filter((l) => l.type === 't')).toHaveLength(36);
    expect(lessons.filter((l) => l.type === 'x')).toHaveLength(4);
  });

  it('hat Generalprobe, Probestunde, Einrichtung, Onboarding und Offene Entscheidungen', () => {
    for (const c of Object.values(content.checklists)) {
      expect(c.groups.length, c.id).toBeGreaterThan(0);
      expect(c.groups.flatMap((g) => g.items).length, c.id).toBeGreaterThan(0);
    }
  });

  it('jede Aufgabe hat eine eindeutige ID, Rolle und deutschen Text', () => {
    const items = [...lessons, ...Object.values(content.checklists)].flatMap((l) =>
      l.groups.flatMap((g) => g.items),
    );
    expect(new Set(items.map((x) => x.id)).size).toBe(items.length);
    for (const x of items) {
      expect(x.text.de).not.toBe('');
      expect(['H', 'A', 'N', 'T', 'ALL']).toContain(x.role);
    }
  });
});

describe('Kennzeichnungen und offene Entscheidungen', () => {
  it('übernimmt alle offenen Entscheidungen (21)', () => {
    expect(content.decisions).toHaveLength(21);
    for (const d of content.decisions) expect(d.label).toBe('OFFENE ENTSCHEIDUNG');
  });

  it('hat alle vier Kennzeichnungen', () => {
    const used = new Set(content.statements.map((s) => s.label));
    for (const l of LABELS) expect(used.has(l), l).toBe(true);
    for (const s of content.statements) expect(s.text, `${s.page}/${s.section}`).not.toBe('');
  });

  it('jede Kennzeichnung im Seitentext ist als Aussage erfasst', () => {
    const marks = Object.values(content.pages)
      .flat()
      .flatMap(
        (line) => line.match(/\[(EXISTING|IMPROVEMENT|PROPOSAL|OFFENE ENTSCHEIDUNG)\]/g) ?? [],
      );
    expect(content.statements).toHaveLength(marks.length);
  });
});

describe('content/ entspricht legacy/index.html', () => {
  let fresh: ExtractedContent;
  beforeAll(() => {
    fresh = extractContent(loadLegacy());
  }, 60_000);

  it('alle 73 Kennzeichnungen im Legacy-Code werden ausgegeben', () => {
    const src = readFileSync(LEGACY_PATH, 'utf8');
    expect(src.match(/sb\("(EX|IM|PR|OD)"\)/g)).toHaveLength(73);
    // Einige Aufrufe stehen in Schleifen und erzeugen mehrere Aussagen.
    expect(fresh.statements.length).toBeGreaterThanOrEqual(73);
  });

  it('die eingecheckten JSON-Dateien sind aktuell (pnpm extract)', () => {
    const { lessons: freshLessons, ...rest } = fresh;
    const { lessonsByLevel, ...stored } = content;
    expect(stored).toEqual(rest);
    expect(Object.values(lessonsByLevel).flat()).toEqual(freshLessons);
  });

  it('Skript-HTML aus legacy wird vollständig zerlegt (kein Text geht verloren)', () => {
    const rt = loadLegacy();
    for (const id of ['A1.1.Di', 'A2.3.Fr', 'B2.10.So', 'probe.ps']) {
      const html = rt.run<string>(
        `(function(){state.lang="de";return scriptHTML(findLesson(${JSON.stringify(id)}));})()`,
      );
      const legacyText = html
        .replace(/<label class="note">[\s\S]*?<\/label>/, '')
        .replace(/<span class="tm">[^<]*<\/span>/g, '')
        .replace(/<summary>[^<]*<\/summary>/g, '')
        .replace(/<b>بالدارجة:<\/b>/g, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/[\s•:]+/g, '');
      const ours = (content.readouts[id] ?? [])
        .flatMap((s) => [
          s.titel.de,
          ...s.blocks.flatMap((b) =>
            b.type === 'exercises'
              ? b.items.flatMap((e) => [e.frage, e.loesung])
              : b.type === 'facts'
                ? b.groups.flatMap((g) => [g.title, ...g.items])
                : [b.text],
          ),
        ])
        .join('')
        .replace(/[\s•:]+/g, '');
      expect(ours, id).toBe(legacyText);
    }
  });
});

describe('Feste Texte in den Seiten stammen aus legacy', () => {
  // Texte, die in der App direkt im Seiten-Code stehen, weil sie in legacy ohne eigene Daten-Variable vorkommen.
  const fixed: [string, string][] = [
    ['mat', 'Hueber: Menschen, Menschen hier, Schritte plus Neu, Miteinander!, Momente.'],
    ['mat', 'Klett: Netzwerk neu (A1 bis B1).'],
    [
      'ops',
      'Der Unterschied ändert sich im Jahr (Sommer-/Winterzeit in Deutschland, Ramadan in Marokko). Bei jeder Einladung beide Uhrzeiten schreiben.',
    ],
    ['ops', 'Platzhalter in [eckigen Klammern] vor dem Senden ersetzen.'],
    [
      'guide',
      'Limits und Preise ändern sich. Vor dem Kauf immer auf der Seite des Anbieters prüfen.',
    ],
    [
      'de',
      'Bestehende Stunden mit direktem Bezug zum Leben in Deutschland, neu nach Themen gruppiert. Ein Tipp öffnet die Stunde mit Skript.',
    ],
    [
      'lo',
      'Messbare Ziele pro Modul, abgeleitet aus den bestehenden Themen, Sprechsituationen und Wortfeldern.',
    ],
    ['doc', 'Kurz nach jeder Stunde ausfüllen. Felder sind aus dem Skript vorausgefüllt.'],
    [
      'play',
      'Dokumentiert werden: Thema, behandelte Inhalte, Lernfortschritt, wichtige Fehler, Hausaufgabe, nächstes Lernziel, besondere Probleme.',
    ],
  ];
  for (const [page, text] of fixed) {
    it(`${page}: ${text.slice(0, 40)} …`, () => {
      expect(content.pages[page]?.join('\n')).toContain(text);
    });
  }
});
