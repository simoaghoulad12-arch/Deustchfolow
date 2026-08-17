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
import { PrismaClient, ExerciseType, LearningSkill } from '@prisma/client';

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
