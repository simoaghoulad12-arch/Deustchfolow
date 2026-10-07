import { describe, expect, it } from 'vitest';
import { planLegacyImport, planSummary } from '../lib/legacyImport';
import { loadLegacy } from '../scripts/legacy-runtime';

/** Export wie ihn die alte Version erzeugt: Datensätze über putRec, dann JSON.stringify(DATA). */
function legacyExport(): string {
  const rt = loadLegacy();
  return rt.run<string>(`(function(){
    putRec("students",{id:"s1",created:"2026-01-05",name:"Amal (Test)",level:"A2",start:"2026-01-05",module:"3",
      skills:{gr:4,wo:0,sp:3,ho:0,le:5,sc:2},strengths:"Aussprache",weaknesses:"Artikel",goals:"Perfekt"});
    putRec("students",{id:"s2",name:"Karim (Test)",level:"A2",start:"",module:"",skills:{},strengths:"",weaknesses:"",goals:""});
    putRec("docs",{id:"d1",date:"2026-01-06",teacher:"Lehrkraft 1",level:"A2",lessonId:"A2.3.Di",lessonTitle:"x",present:["s1"],absent:["s2"],
      covered:"Thema",canNow:"kann",errors:"Fehler",homework:"5 Sätze",next:"weiter",material:"S. 12",problems:""});
    putRec("docs",{id:"d2",date:"kaputt",level:"A2",lessonId:"A2.3.Mi",present:[],absent:[]});
    putRec("errors",{id:"e1",student:"s2",date:"2026-01-06",error:"Ich habe gegeht",correction:"Ich bin gegangen",category:"Grammatik",status:"offen"});
    putRec("errors",{id:"e2",student:"unbekannt",error:"x",category:"Grammatik",status:"offen"});
    putRec("homework",{id:"h1",student:"s1",task:"5 Sätze",goal:"Perfekt",deadline:"2026-01-08",status:"Abgegeben",feedback:""});
    putRec("materials",{id:"A2.3.Di",note:"Menschen A2, Lektion 3"});
    return JSON.stringify(DATA);
  })()`);
}

describe('Import aus der alten Version', () => {
  const plan = planLegacyImport(legacyExport());

  it('übernimmt Schüler mit Modul und Fertigkeiten (0 = nicht eingeschätzt)', () => {
    expect(plan.students).toHaveLength(2);
    const amal = plan.students[0]!.row;
    expect(amal).toMatchObject({
      name: 'Amal (Test)',
      level: 'A2',
      start_date: '2026-01-05',
      current_module: 'A2.3',
      skill_grammar: 4,
      skill_vocabulary: null,
      skill_speaking: 3,
      strengths: 'Aussprache',
      next_goals: 'Perfekt',
    });
    expect(plan.students[1]!.row.start_date).toBeNull();
  });

  it('eine Gruppe pro Level, weil die alte Version keine Gruppen kannte', () => {
    expect(plan.groups).toEqual([{ key: 'A2', name: 'Übernommen A2' }]);
  });

  it('Dokumentation mit Anwesenheit; Lehrkraft als Text bleibt erhalten; ungültige werden gemeldet', () => {
    expect(plan.docs).toHaveLength(1);
    expect(plan.docs[0]).toMatchObject({ present: ['s1'], absent: ['s2'] });
    expect(plan.docs[0]!.row).toMatchObject({
      lesson_id: 'A2.3.Di',
      can_do: 'kann',
      next_lesson: 'weiter',
      problems: 'Lehrkraft (alte Version): Lehrkraft 1',
    });
    expect(plan.warnings.some((w) => w.includes('Dokumentation vom kaputt'))).toBe(true);
  });

  it('Fehler, Hausaufgaben, Lehrbuch-Notizen; unbekannte Schüler werden übersprungen', () => {
    expect(plan.errors).toHaveLength(1);
    expect(plan.errors[0]).toMatchObject({
      legacyStudent: 's2',
      row: { correction: 'Ich bin gegangen', status: 'offen' },
    });
    expect(plan.homework[0]).toMatchObject({
      legacyStudent: 's1',
      row: { status: 'Abgegeben', deadline: '2026-01-08' },
    });
    expect(plan.notes).toEqual([{ lessonId: 'A2.3.Di', note: 'Menschen A2, Lektion 3' }]);
    expect(plan.warnings.some((w) => w.includes('ohne bekannten Schüler'))).toBe(true);
    expect(planSummary(plan)).toBe(
      '1 Gruppen, 2 Schüler, 1 Dokumentationen, 1 Fehler, 1 Hausaufgaben, 1 Lehrbuch-Notizen',
    );
  });

  it('ungültiger Text wird abgelehnt', () => {
    expect(() => planLegacyImport('kein json')).toThrow('kein gültiger Export');
    expect(() => planLegacyImport('{"foo":1}')).toThrow('fehlen die Sammlungen');
    expect(() => planLegacyImport('[]')).toThrow('kein gültiger Export');
  });
});
