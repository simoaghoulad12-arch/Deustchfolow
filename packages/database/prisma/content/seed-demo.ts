/**
 * Development-only demo accounts with realistic learning history so the
 * dashboard, error memory, Language DNA and SRS screens have something to
 * show on first login. Never imported by the production-safe content seed.
 *
 *   demo@deutschflow.app  / Demo1234!   (learner, German A1, onboarded)
 *   admin@deutschflow.app / Demo1234!   (ADMIN, for the content CMS)
 */
import type { PrismaClient, DnaDimension, MistakeCategory } from '@prisma/client';

/** bcrypt (cost 12) of "Demo1234!" — precomputed so the seed needs no bcrypt dependency. */
const DEMO_PASSWORD_HASH = '$2a$12$9Cd4VjrXLu9calCK9vUm1.IglJg4yJLRX7R2R81xcVKYLpSHaCT4O';

const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

export async function seedDemo(prisma: PrismaClient) {
  const now = new Date();

  const admin = await prisma.user.upsert({
    where: { email: 'admin@deutschflow.app' },
    update: {},
    create: {
      email: 'admin@deutschflow.app',
      passwordHash: DEMO_PASSWORD_HASH,
      role: 'ADMIN',
      emailVerified: now,
      profile: { create: { displayName: 'Admin' } },
    },
  });

  const existing = await prisma.user.findUnique({ where: { email: 'demo@deutschflow.app' } });
  if (existing) {
    console.log('  · demo users already present');
    return;
  }

  const user = await prisma.user.create({
    data: {
      email: 'demo@deutschflow.app',
      passwordHash: DEMO_PASSWORD_HASH,
      emailVerified: now,
      profile: { create: { displayName: 'Alex' } },
      learningProfile: {
        create: {
          nativeLanguage: 'en',
          explanationLanguage: 'en',
          currentLevel: 'A1',
          targetLevel: 'A2',
          targetLanguageCode: 'de',
          goals: ['relocation', 'work'],
          dailyMinutes: 20,
          learningStyles: ['speaking', 'vocabulary'],
          personalGoal: 'Feel at home in Berlin and start a job in German.',
          onboardingCompletedAt: daysAgo(6),
        },
      },
    },
  });
  const userId = user.id;
  const lang = 'de';

  await prisma.learningPlan.create({
    data: {
      userId,
      languageCode: lang,
      startLevel: 'A1',
      targetLevel: 'A2',
      dailyMinutes: 20,
      focusSkills: ['SPEAKING', 'VOCABULARY'],
      plan: {
        headline: '20 minutes a day takes you from A1 to A2 in about 45 weeks — built around “Feel at home in Berlin and start a job in German.”',
        targetLevel: 'A2',
        estimatedWeeks: 45,
        focusSkills: ['SPEAKING', 'VOCABULARY'],
        dailyRoutine: [
          { kind: 'review', title: 'Review due words', minutes: 3, href: '/vocabulary' },
          { kind: 'mission', title: 'Live a mission', minutes: 9, href: '/world' },
          { kind: 'speaking', title: 'Speaking practice', minutes: 5, href: '/speak' },
          { kind: 'challenge', title: 'Daily challenge', minutes: 3, href: '/home#challenge' },
        ],
        weeks: [
          { week: 1, theme: 'Finding an apartment', activities: ['3 missions in the German world', 'Grammar focus for A1', 'Speaking + Brain mode sessions'] },
          { week: 2, theme: 'Government offices', activities: ['3 missions in the German world', 'Grammar focus for A1', 'Speaking + Brain mode sessions'] },
          { week: 3, theme: 'Doctor and pharmacy', activities: ['3 missions in the German world', 'Grammar focus for A1', 'Speaking + Brain mode sessions'] },
          { week: 4, theme: 'Banking and contracts', activities: ['3 missions in the German world', 'Checkpoint: a harder mission and a progress review', 'Speaking + Brain mode sessions'] },
        ],
      },
    },
  });

  const xpHistory: [number, string, number][] = [
    [5, 'mission', 100], [5, 'review', 15], [4, 'speaking', 75], [3, 'mission', 100],
    [2, 'daily_challenge', 100], [2, 'review', 20], [1, 'mission', 100], [1, 'journal', 40],
  ];
  await prisma.xpEvent.createMany({
    data: xpHistory.map(([ago, source, amount]) => ({ userId, languageCode: lang, source, amount, createdAt: daysAgo(ago) })),
  });
  const totalXp = xpHistory.reduce((s, [, , a]) => s + a, 0);
  await prisma.learnerStats.create({
    data: {
      userId,
      languageCode: lang,
      totalXp,
      currentStreak: 5,
      longestStreak: 5,
      lastActiveDate: dayKey(daysAgo(1)),
      learningMinutes: 64,
      speakingMinutes: 18,
      difficulty: 3.2,
      proficiency: 1.3,
    },
  });

  const dna: [DnaDimension, number, number][] = [
    ['VOCABULARY', 46, 6], ['GRAMMAR', 38, 6], ['SPEAKING', 52, 5], ['LISTENING', 41, 3], ['READING', 49, 2],
    ['WRITING', 35, 3], ['PRONUNCIATION', 44, 2], ['FLUENCY', 47, 5], ['ACCURACY', 36, 6], ['RESPONSE_SPEED', 55, 4],
  ];
  await prisma.dnaScore.createMany({ data: dna.map(([dimension, score, samples]) => ({ userId, languageCode: lang, dimension, score, samples })) });

  const mistakes: [MistakeCategory, string, string, string, number][] = [
    ['GRAMMAR', 'Ich möchte ein Kaffee.', 'Ich möchte einen Kaffee.', '"Kaffee" is masculine. After möchten it is the object (accusative): ein → einen.', 3],
    ['WORD_CHOICE', 'Ich will einen Tee.', 'Ich möchte einen Tee.', '"Ich will" sounds demanding when ordering. "Ich möchte" or "Ich hätte gern" is polite.', 2],
    ['GRAMMAR', 'Ich habe 28 Jahre.', 'Ich bin 28 Jahre alt.', 'In German you "are" an age: Ich bin … Jahre alt.', 1],
    ['SENTENCE_STRUCTURE', 'weil ich habe keine Zeit', 'weil ich keine Zeit habe', 'After "weil" the conjugated verb goes to the end.', 2],
  ];
  for (const [category, original, corrected, explanation, frequency] of mistakes) {
    const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9äöüß ]+/g, ' ').replace(/\s+/g, ' ').trim();
    await prisma.mistake.create({
      data: {
        userId,
        languageCode: lang,
        category,
        original,
        corrected,
        explanation,
        key: `${norm(original)}=>${norm(corrected)}`,
        frequency,
        source: 'mission',
        lastSeenAt: daysAgo(frequency),
      },
    });
  }

  const deck = await prisma.vocabulary.findMany({ where: { languageCode: lang, level: 'A1', category: 'food & drink' }, take: 14 });
  await prisma.userVocabulary.createMany({
    data: deck.map((v, i) => ({
      userId,
      vocabularyId: v.id,
      status: i < 3 ? 'MASTERED' : 'LEARNING',
      correctCount: i < 3 ? 5 : 1,
      repetitions: i < 3 ? 4 : 1,
      intervalDays: i < 3 ? 12 : 1,
      lastReviewedAt: daysAgo(2),
      // Roughly half of the deck is due now so the review screen has work.
      nextReviewAt: i < 3 ? daysAgo(-10) : i % 2 === 0 ? daysAgo(1) : daysAgo(-1),
      confidence: i < 3 ? 4 : 2,
    })),
  });

  await prisma.journalEntry.create({
    data: {
      userId,
      languageCode: lang,
      text: 'Heute ich bin in ein Café gegangen. Ich habe ein Kaffee bestellt und ein Kuchen.',
      correctedText: 'Heute bin ich in ein Café gegangen. Ich habe einen Kaffee und einen Kuchen bestellt.',
      score: 64,
      wordCount: 15,
      analysis: {
        corrections: [
          { original: 'Heute ich bin', better: 'Heute bin ich', explanation: 'The verb is always in second position.', category: 'SENTENCE_STRUCTURE' },
          { original: 'ein Kaffee', better: 'einen Kaffee', explanation: 'Accusative masculine: einen.', category: 'GRAMMAR' },
        ],
        strengths: ['Good use of the perfect tense with "sein" for movement.'],
      },
      createdAt: daysAgo(1),
    },
  });

  await prisma.placementResult.create({
    data: {
      userId,
      languageCode: lang,
      estimatedLevel: 'A1',
      skillScores: { GRAMMAR: 42, VOCABULARY: 51, READING: 55 },
      answers: [],
      createdAt: daysAgo(6),
    },
  });

  console.log(`  · demo learner ${user.email} and admin ${admin.email} (password Demo1234!)`);
}
