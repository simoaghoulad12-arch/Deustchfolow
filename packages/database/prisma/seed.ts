/**
 * Development/test seed data ONLY. This is a small, hand-written sample
 * (1 level, 1 course, 2 modules, 4 lessons, ~10 exercises, 8 vocabulary
 * items) to develop and manually test the Learning Engine against — it is
 * explicitly NOT the real A1–C1 curriculum, which is a separate,
 * later content project (see docs/architecture-decisions/
 * phase-3-learning-engine.md, spec section 26).
 *
 * Refuses to run in production so this can never end up seeded into a
 * real environment by accident.
 */
import {
  PrismaClient,
  ExerciseType,
  LearningSkill,
  CEFRLevel,
  SimulationCategory,
  CareerModuleType,
} from '@prisma/client';

if (process.env.NODE_ENV === 'production') {
  throw new Error('Refusing to run development seed data against a production environment.');
}

const prisma = new PrismaClient();

async function main() {
  const level = await prisma.level.upsert({
    where: { code: 'A1' },
    update: {},
    create: {
      code: 'A1',
      name: 'A1 – Anfänger',
      description: 'Einstieg ins Deutsche: einfache, alltägliche Ausdrücke.',
      order: 1,
    },
  });

  const course = await prisma.course.upsert({
    where: { slug: 'a1-grundlagen' },
    update: {},
    create: {
      levelId: level.id,
      title: 'DeutschFlow A1 – Grundlagen',
      slug: 'a1-grundlagen',
      description: 'Erste Schritte: sich vorstellen, begrüßen, über die Familie sprechen.',
      order: 1,
    },
  });

  const moduleBegruessung = await prisma.module.upsert({
    where: { courseId_slug: { courseId: course.id, slug: 'begruessung-vorstellung' } },
    update: {},
    create: {
      courseId: course.id,
      title: 'Begrüßung & Vorstellung',
      slug: 'begruessung-vorstellung',
      description: 'Sich und andere vorstellen, grundlegende Begrüßungen.',
      order: 1,
    },
  });

  const moduleAlltag = await prisma.module.upsert({
    where: { courseId_slug: { courseId: course.id, slug: 'alltag-familie' } },
    update: {},
    create: {
      courseId: course.id,
      title: 'Alltag & Familie',
      slug: 'alltag-familie',
      description: 'Über Familie und den eigenen Alltag sprechen.',
      order: 2,
    },
  });

  const lessonVorstellen = await prisma.lesson.upsert({
    where: { slug: 'sich-vorstellen' },
    update: {},
    create: {
      moduleId: moduleBegruessung.id,
      title: 'Sich vorstellen',
      slug: 'sich-vorstellen',
      description: 'Wie man sich auf Deutsch mit Namen vorstellt.',
      skill: LearningSkill.SPEAKING,
      difficulty: 1,
      estimatedMinutes: 10,
      order: 1,
      objectives: ['Sich mit Namen vorstellen', 'Nach dem Namen einer anderen Person fragen'],
    },
  });

  const lessonBegruessungen = await prisma.lesson.upsert({
    where: { slug: 'begruessungen' },
    update: {},
    create: {
      moduleId: moduleBegruessung.id,
      title: 'Begrüßungen',
      slug: 'begruessungen',
      description: 'Die wichtigsten Begrüßungsformeln im Deutschen.',
      skill: LearningSkill.VOCABULARY,
      difficulty: 1,
      estimatedMinutes: 8,
      order: 2,
      objectives: ['Begrüßungen zur richtigen Tageszeit verwenden'],
      prerequisites: { connect: [{ id: lessonVorstellen.id }] },
    },
  });

  const lessonFamilie = await prisma.lesson.upsert({
    where: { slug: 'familie' },
    update: {},
    create: {
      moduleId: moduleAlltag.id,
      title: 'Familie',
      slug: 'familie',
      description: 'Familienmitglieder auf Deutsch benennen.',
      skill: LearningSkill.VOCABULARY,
      difficulty: 1,
      estimatedMinutes: 12,
      order: 1,
      objectives: ['Die wichtigsten Familienmitglieder benennen'],
    },
  });

  const lessonAlltag = await prisma.lesson.upsert({
    where: { slug: 'der-alltag' },
    update: {},
    create: {
      moduleId: moduleAlltag.id,
      title: 'Der Alltag',
      slug: 'der-alltag',
      description: 'Einfache Sätze über den eigenen Tagesablauf lesen und verstehen.',
      skill: LearningSkill.READING,
      difficulty: 2,
      estimatedMinutes: 15,
      order: 2,
      objectives: ['Einen einfachen Text über den Alltag verstehen'],
      prerequisites: { connect: [{ id: lessonFamilie.id }] },
    },
  });

  // --- Exercises: sich-vorstellen ---
  await upsertMultipleChoice({
    lessonId: lessonVorstellen.id,
    order: 1,
    prompt: 'Wie fragt man auf Deutsch nach dem Namen einer Person?',
    explanation: '„Wie heißt du?“ ist die Standardfrage nach dem Namen.',
    options: [
      { text: 'Wie heißt du?', isCorrect: true },
      { text: 'Wie alt bist du?', isCorrect: false },
      { text: 'Woher kommst du?', isCorrect: false },
    ],
  });

  await upsertTrueFalse({
    lessonId: lessonVorstellen.id,
    order: 2,
    prompt: '„Ich heiße Anna“ bedeutet auf Englisch „My name is Anna“.',
    explanation: '„Ich heiße …“ ist die Standardformel, um den eigenen Namen zu nennen.',
    isTrue: true,
  });

  await upsertTextExercise({
    lessonId: lessonVorstellen.id,
    order: 3,
    type: ExerciseType.FILL_BLANK,
    prompt: 'Ergänze die Lücke: „___ heißt Marco.“',
    questionText: '___ heißt Marco.',
    correctAnswer: 'Er',
    explanation: '„Er“ ersetzt einen männlichen Namen in der dritten Person Singular.',
  });

  // --- Exercises: begruessungen ---
  await upsertMultipleChoice({
    lessonId: lessonBegruessungen.id,
    order: 1,
    prompt: 'Welche Begrüßung passt am Morgen?',
    explanation: '„Guten Morgen“ verwendet man bis etwa 10–11 Uhr.',
    options: [
      { text: 'Guten Morgen', isCorrect: true },
      { text: 'Gute Nacht', isCorrect: false },
      { text: 'Guten Abend', isCorrect: false },
    ],
  });

  await upsertTextExercise({
    lessonId: lessonBegruessungen.id,
    order: 2,
    type: ExerciseType.TRANSLATION,
    prompt: 'Übersetze ins Deutsche: „Goodbye“',
    questionText: 'Goodbye',
    correctAnswer: 'Auf Wiedersehen',
    explanation: '„Auf Wiedersehen“ ist die formelle Verabschiedung.',
  });

  // --- Exercises: familie ---
  await upsertMultipleChoice({
    lessonId: lessonFamilie.id,
    order: 1,
    prompt: 'Was bedeutet „die Mutter“?',
    explanation: '„die Mutter“ = „mother“.',
    options: [
      { text: 'mother', isCorrect: true },
      { text: 'father', isCorrect: false },
      { text: 'sister', isCorrect: false },
    ],
  });

  await upsertTextExercise({
    lessonId: lessonFamilie.id,
    order: 2,
    type: ExerciseType.SHORT_ANSWER,
    prompt: 'Wie heißt der Bruder deines Vaters (oder deiner Mutter)?',
    questionText: 'Wie heißt der Bruder deines Vaters?',
    correctAnswer: 'Onkel',
    explanation: 'Der Bruder eines Elternteils ist der „Onkel“.',
  });

  await upsertOrderWords({
    lessonId: lessonFamilie.id,
    order: 3,
    prompt: 'Bringe die Wörter in die richtige Reihenfolge.',
    explanation: 'Richtige Wortstellung: „Das ist meine Schwester.“',
    words: ['Das', 'ist', 'meine', 'Schwester'],
  });

  // --- Exercises: der-alltag ---
  await upsertTrueFalse({
    lessonId: lessonAlltag.id,
    order: 1,
    prompt: '„Ich stehe um sieben Uhr auf“ bedeutet, dass jemand um 7 Uhr aufsteht.',
    explanation: '„aufstehen“ = aus dem Bett kommen.',
    isTrue: true,
  });

  await upsertMultipleChoice({
    lessonId: lessonAlltag.id,
    order: 2,
    prompt: 'Was bedeutet „der Alltag“?',
    explanation: '„der Alltag“ = „everyday life“.',
    options: [
      { text: 'everyday life', isCorrect: true },
      { text: 'the weekend', isCorrect: false },
      { text: 'the holiday', isCorrect: false },
    ],
  });

  // --- Vocabulary ---
  const vocabulary: Array<{
    word: string;
    translation: string;
    partOfSpeech: string;
    exampleSentence?: string;
  }> = [
    { word: 'das Haus', translation: 'house', partOfSpeech: 'Nomen', exampleSentence: 'Das Haus ist groß.' },
    { word: 'die Familie', translation: 'family', partOfSpeech: 'Nomen' },
    { word: 'die Mutter', translation: 'mother', partOfSpeech: 'Nomen' },
    { word: 'der Vater', translation: 'father', partOfSpeech: 'Nomen' },
    { word: 'der Bruder', translation: 'brother', partOfSpeech: 'Nomen' },
    { word: 'die Schwester', translation: 'sister', partOfSpeech: 'Nomen' },
    { word: 'gut', translation: 'good', partOfSpeech: 'Adjektiv', exampleSentence: 'Das ist gut.' },
    { word: 'sprechen', translation: 'to speak', partOfSpeech: 'Verb', exampleSentence: 'Ich spreche Deutsch.' },
  ];

  for (const entry of vocabulary) {
    const normalizedWord = entry.word.trim().toLowerCase();
    await prisma.vocabulary.upsert({
      where: { normalizedWord_level: { normalizedWord, level: 'A1' } },
      update: {},
      create: {
        word: entry.word,
        normalizedWord,
        translation: entry.translation,
        level: 'A1',
        partOfSpeech: entry.partOfSpeech,
        exampleSentence: entry.exampleSentence,
      },
    });
  }

  console.log('[seed] Development/test learning content seeded (A1, 1 course, 2 modules, 4 lessons).');

  await seedSimulations();
  await seedCareerModules();
}

/**
 * A small, hand-written sample — one per emoji category from spec
 * section 15 — not the real, comprehensive simulation catalog (same
 * "development/test only" framing as the learning content above).
 */
async function seedSimulations() {
  const simulations: Array<{
    title: string;
    category: SimulationCategory;
    cefrLevel: CEFRLevel;
    situation: string;
    goal: string;
    roles: string[];
    expectedSkills: LearningSkill[];
  }> = [
    {
      title: 'Wohnungsbesichtigung vereinbaren',
      category: SimulationCategory.HOUSING,
      cefrLevel: CEFRLevel.A2,
      situation: 'Du rufst wegen einer Wohnungsanzeige an und möchtest einen Besichtigungstermin vereinbaren.',
      goal: 'Einen Besichtigungstermin vereinbaren und die wichtigsten Eckdaten der Wohnung erfragen.',
      roles: ['Vermieter:in'],
      expectedSkills: [LearningSkill.SPEAKING, LearningSkill.LISTENING],
    },
    {
      title: 'Arzttermin vereinbaren',
      category: SimulationCategory.DOCTOR,
      cefrLevel: CEFRLevel.A2,
      situation: 'Du möchtest einen Arzttermin telefonisch vereinbaren.',
      goal: 'Einen passenden Termin finden und die wichtigsten Informationen austauschen.',
      roles: ['Arzthelferin'],
      expectedSkills: [LearningSkill.SPEAKING, LearningSkill.LISTENING],
    },
    {
      title: 'Konto eröffnen',
      category: SimulationCategory.BANK,
      cefrLevel: CEFRLevel.B1,
      situation: 'Du bist bei der Bank und möchtest ein neues Girokonto eröffnen.',
      goal: 'Die notwendigen Unterlagen und Schritte für eine Kontoeröffnung verstehen und erfragen.',
      roles: ['Bankberater:in'],
      expectedSkills: [LearningSkill.SPEAKING, LearningSkill.VOCABULARY],
    },
    {
      title: 'Anmeldung beim Bürgeramt',
      category: SimulationCategory.GOVERNMENT_OFFICE,
      cefrLevel: CEFRLevel.B1,
      situation: 'Du meldest deinen neuen Wohnsitz beim Bürgeramt an.',
      goal: 'Die Anmeldung erfolgreich durchführen und verstehen, welche Unterlagen benötigt werden.',
      roles: ['Sachbearbeiter:in'],
      expectedSkills: [LearningSkill.SPEAKING, LearningSkill.LISTENING],
    },
    {
      title: 'Fahrkarte am Schalter kaufen',
      category: SimulationCategory.TRANSPORT,
      cefrLevel: CEFRLevel.A1,
      situation: 'Du kaufst am Bahnhofsschalter eine Fahrkarte für eine bestimmte Verbindung.',
      goal: 'Die richtige Fahrkarte für dein Ziel kaufen.',
      roles: ['Schalterangestellte:r'],
      expectedSkills: [LearningSkill.SPEAKING, LearningSkill.VOCABULARY],
    },
    {
      title: 'Im Supermarkt nach einem Produkt fragen',
      category: SimulationCategory.SHOPPING,
      cefrLevel: CEFRLevel.A1,
      situation: 'Du findest ein Produkt im Supermarkt nicht und fragst eine Mitarbeiterin.',
      goal: 'Herausfinden, wo sich das gesuchte Produkt befindet.',
      roles: ['Mitarbeiter:in'],
      expectedSkills: [LearningSkill.SPEAKING, LearningSkill.VOCABULARY],
    },
    {
      title: 'Reklamation am Telefon',
      category: SimulationCategory.PHONE_CALL,
      cefrLevel: CEFRLevel.B1,
      situation: 'Du rufst bei einem Kundenservice an, weil eine Bestellung nicht angekommen ist.',
      goal: 'Das Problem klar schildern und eine Lösung erfragen.',
      roles: ['Kundenservice-Mitarbeiter:in'],
      expectedSkills: [LearningSkill.SPEAKING, LearningSkill.LISTENING],
    },
    {
      title: 'Krankmeldung beim Arbeitgeber',
      category: SimulationCategory.WORK,
      cefrLevel: CEFRLevel.B1,
      situation: 'Du bist krank und musst dich telefonisch bei deiner Vorgesetzten krankmelden.',
      goal: 'Die Krankmeldung höflich und klar kommunizieren.',
      roles: ['Vorgesetzte:r'],
      expectedSkills: [LearningSkill.SPEAKING],
    },
    {
      title: 'Sprechstunde an der Universität',
      category: SimulationCategory.STUDY,
      cefrLevel: CEFRLevel.B2,
      situation: 'Du besuchst die Sprechstunde eines Professors, um eine Frage zu deiner Hausarbeit zu klären.',
      goal: 'Deine Frage klar formulieren und die Antwort verstehen.',
      roles: ['Professor:in'],
      expectedSkills: [LearningSkill.SPEAKING, LearningSkill.LISTENING],
    },
    {
      title: 'Paket bei der Postfiliale abholen',
      category: SimulationCategory.PACKAGE,
      cefrLevel: CEFRLevel.A1,
      situation: 'Du holst ein Paket ab, das nicht zugestellt werden konnte, bei der Postfiliale ab.',
      goal: 'Das Paket erfolgreich abholen.',
      roles: ['Postmitarbeiter:in'],
      expectedSkills: [LearningSkill.SPEAKING, LearningSkill.VOCABULARY],
    },
    {
      title: 'Neue Nachbarn kennenlernen',
      category: SimulationCategory.NEIGHBORS,
      cefrLevel: CEFRLevel.A1,
      situation: 'Du triffst deine neuen Nachbarn im Treppenhaus zum ersten Mal.',
      goal: 'Dich vorstellen und ein kurzes, freundliches Gespräch führen.',
      roles: ['Nachbar:in'],
      expectedSkills: [LearningSkill.SPEAKING],
    },
  ];

  for (const simulation of simulations) {
    const existing = await prisma.simulation.findFirst({ where: { title: simulation.title } });
    if (existing) continue;
    await prisma.simulation.create({ data: simulation });
  }

  console.log(`[seed] ${simulations.length} development/test Real-Life Simulations seeded.`);
}

/** One prepared topic per CareerModuleType (spec section 16) — a guide to read, not an auto-generated document. */
async function seedCareerModules() {
  const modules: Array<{
    type: CareerModuleType;
    title: string;
    description: string;
    cefrLevel: CEFRLevel | null;
  }> = [
    {
      type: CareerModuleType.CV,
      title: 'Lebenslauf auf Deutsch',
      description:
        'Aufbau, übliche Abschnitte und typische Formulierungen für einen deutschen Lebenslauf (tabellarischer Lebenslauf).',
      cefrLevel: CEFRLevel.B1,
    },
    {
      type: CareerModuleType.COVER_LETTER,
      title: 'Anschreiben verfassen',
      description: 'Struktur und Sprache eines überzeugenden Anschreibens für eine Bewerbung in Deutschland.',
      cefrLevel: CEFRLevel.B1,
    },
    {
      type: CareerModuleType.INTERVIEW,
      title: 'Vorstellungsgespräch vorbereiten',
      description: 'Typische Fragen, Redewendungen und Verhaltensweisen für ein Vorstellungsgespräch auf Deutsch.',
      cefrLevel: CEFRLevel.B2,
    },
    {
      type: CareerModuleType.WORKPLACE_GERMAN,
      title: 'Deutsch am Arbeitsplatz',
      description: 'Alltägliche Kommunikation im Berufsleben: Meetings, Small Talk, E-Mails an Kolleg:innen.',
      cefrLevel: CEFRLevel.B1,
    },
    {
      type: CareerModuleType.PROFESSIONAL_EMAIL,
      title: 'Professionelle E-Mails schreiben',
      description: 'Anrede, Struktur und Register für formelle und halbformelle E-Mails im Berufskontext.',
      cefrLevel: CEFRLevel.B1,
    },
  ];

  for (const module of modules) {
    const existing = await prisma.careerModule.findFirst({ where: { title: module.title } });
    if (existing) continue;
    await prisma.careerModule.create({ data: module });
  }

  console.log(`[seed] ${modules.length} development/test Career modules seeded.`);
}

async function upsertMultipleChoice(input: {
  lessonId: string;
  order: number;
  prompt: string;
  explanation: string;
  options: Array<{ text: string; isCorrect: boolean }>;
}) {
  await upsertOptionExercise({
    ...input,
    type: ExerciseType.MULTIPLE_CHOICE,
    options: input.options.map((option, index) => ({ ...option, order: index })),
  });
}

async function upsertTrueFalse(input: {
  lessonId: string;
  order: number;
  prompt: string;
  explanation: string;
  isTrue: boolean;
}) {
  await upsertOptionExercise({
    lessonId: input.lessonId,
    order: input.order,
    prompt: input.prompt,
    explanation: input.explanation,
    type: ExerciseType.TRUE_FALSE,
    options: [
      { text: 'Richtig', isCorrect: input.isTrue, order: 0 },
      { text: 'Falsch', isCorrect: !input.isTrue, order: 1 },
    ],
  });
}

async function upsertOrderWords(input: {
  lessonId: string;
  order: number;
  prompt: string;
  explanation: string;
  words: string[];
}) {
  await upsertOptionExercise({
    lessonId: input.lessonId,
    order: input.order,
    prompt: input.prompt,
    explanation: input.explanation,
    type: ExerciseType.ORDER_WORDS,
    options: input.words.map((text, index) => ({ text, isCorrect: false, order: index })),
  });
}

async function upsertOptionExercise(input: {
  lessonId: string;
  order: number;
  prompt: string;
  explanation: string;
  type: ExerciseType;
  options: Array<{ text: string; isCorrect: boolean; order: number }>;
}) {
  const existing = await prisma.exercise.findUnique({
    where: { lessonId_order: { lessonId: input.lessonId, order: input.order } },
  });
  if (existing) return;

  await prisma.exercise.create({
    data: {
      lessonId: input.lessonId,
      type: input.type,
      prompt: input.prompt,
      explanation: input.explanation,
      order: input.order,
      questions: {
        create: {
          text: input.prompt,
          order: 0,
          options: { create: input.options },
        },
      },
    },
  });
}

async function upsertTextExercise(input: {
  lessonId: string;
  order: number;
  type: ExerciseType;
  prompt: string;
  questionText: string;
  correctAnswer: string;
  explanation: string;
}) {
  const existing = await prisma.exercise.findUnique({
    where: { lessonId_order: { lessonId: input.lessonId, order: input.order } },
  });
  if (existing) return;

  await prisma.exercise.create({
    data: {
      lessonId: input.lessonId,
      type: input.type,
      prompt: input.prompt,
      explanation: input.explanation,
      order: input.order,
      questions: {
        create: {
          text: input.questionText,
          order: 0,
          correctAnswer: input.correctAnswer,
        },
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
