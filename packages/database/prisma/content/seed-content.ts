/**
 * Immersion platform content seed: languages, world, characters, missions,
 * vocabulary, grammar + exercises, placement pool, challenge templates, the
 * CEFR curriculum and platform defaults.
 *
 * Unlike the legacy dev sample in ../seed.ts this is real learning content
 * and safe to run in any environment: every write is an idempotent upsert
 * keyed on a natural key, and existing rows are refreshed in place so
 * content fixes in these files reach already-seeded databases. Content
 * that editors may have changed through the admin CMS (exercises, lesson
 * bodies) is only created when missing, never overwritten.
 */
import { Prisma, type CEFRLevel, type LearningSkill, type PrismaClient } from '@prisma/client';
import { LANGUAGES } from './languages';
import { ENVIRONMENTS, CHARACTERS, ACHIEVEMENTS } from './world';
import { MISSIONS_DE, CHAOS_DE, STORY_DE, STORY_CHAPTERS_DE, DEBATE_DE } from './missions-de';
import { MISSIONS_INTL, EXTRA_MODES_EN } from './missions-intl';
import { VOCABULARY, difficultyFor } from './vocabulary';
import { GRAMMAR } from './grammar';
import { CURRICULUM_DE, CURRICULUM_INTL, CHALLENGE_PROMPTS, type ModuleTheme } from './curriculum';
import type { Level, MissionDef } from './types';

const LEVELS: { code: Level; name: string; description: string; order: number }[] = [
  { code: 'A1', name: 'A1 – Beginner', description: 'Understand and use everyday expressions and very basic phrases.', order: 1 },
  { code: 'A2', name: 'A2 – Elementary', description: 'Communicate in simple, routine tasks on familiar topics.', order: 2 },
  { code: 'B1', name: 'B1 – Intermediate', description: 'Handle most travel situations and describe experiences and plans.', order: 3 },
  { code: 'B2', name: 'B2 – Upper intermediate', description: 'Interact fluently and argue a viewpoint on a wide range of topics.', order: 4 },
];

const LESSON_PLAN: { suffix: string; title: (m: ModuleTheme) => string; skill: LearningSkill; minutes: number }[] = [
  { suffix: 'words', title: (m) => `${m.title}: key words`, skill: 'VOCABULARY', minutes: 8 },
  { suffix: 'grammar', title: (m) => `${m.title}: grammar in context`, skill: 'GRAMMAR', minutes: 10 },
  { suffix: 'reading', title: (m) => `${m.title}: read`, skill: 'READING', minutes: 8 },
  { suffix: 'listening', title: (m) => `${m.title}: listen`, skill: 'LISTENING', minutes: 8 },
  { suffix: 'speak-write', title: (m) => `${m.title}: speak & write`, skill: 'SPEAKING', minutes: 12 },
];

const json = (value: unknown) => value as Prisma.InputJsonValue;

export async function seedContent(prisma: PrismaClient) {
  const log = (msg: string) => console.log(`  · ${msg}`);

  for (const l of LANGUAGES) {
    await prisma.language.upsert({ where: { code: l.code }, update: { name: l.name, nativeName: l.nativeName, flag: l.flag, order: l.order }, create: l });
  }
  log(`${LANGUAGES.length} languages`);

  const levelIds = new Map<Level, string>();
  for (const lv of LEVELS) {
    const row = await prisma.level.upsert({ where: { code: lv.code }, update: {}, create: lv });
    levelIds.set(lv.code, row.id);
  }

  const envIds = new Map<string, string>();
  for (const [order, e] of ENVIRONMENTS.entries()) {
    const data = { name: e.name, description: e.description, icon: e.icon, accent: e.accent, minLevel: e.minLevel as CEFRLevel, order };
    const row = await prisma.worldEnvironment.upsert({ where: { slug: e.slug }, update: data, create: { slug: e.slug, ...data } });
    envIds.set(e.slug, row.id);
  }
  log(`${ENVIRONMENTS.length} world environments`);

  const characterIds = new Map<string, string>();
  for (const c of CHARACTERS) {
    const data = {
      name: c.name,
      role: c.role,
      personality: c.personality,
      speakingStyle: c.speakingStyle,
      avatar: c.avatar,
      environmentId: c.env ? (envIds.get(c.env) ?? null) : null,
    };
    const row = await prisma.character.upsert({ where: { slug: c.slug }, update: data, create: { slug: c.slug, ...data } });
    characterIds.set(c.slug, row.id);
  }
  log(`${CHARACTERS.length} characters`);

  for (const a of ACHIEVEMENTS) {
    const data = { title: a.title, description: a.description, icon: a.icon, xpReward: a.xpReward, criteria: json(a.criteria), order: a.order };
    await prisma.achievement.upsert({ where: { code: a.code }, update: data, create: { code: a.code, ...data } });
  }
  log(`${ACHIEVEMENTS.length} achievements`);

  const story = await prisma.story.upsert({
    where: { slug: STORY_DE.slug },
    update: { title: STORY_DE.title, description: STORY_DE.description, cefrLevel: STORY_DE.level },
    create: { slug: STORY_DE.slug, languageCode: 'de', title: STORY_DE.title, description: STORY_DE.description, cefrLevel: STORY_DE.level },
  });

  const allMissions: MissionDef[] = [...MISSIONS_DE, ...CHAOS_DE, ...STORY_CHAPTERS_DE, ...DEBATE_DE, ...MISSIONS_INTL, ...EXTRA_MODES_EN];
  const orderByLang = new Map<string, number>();
  for (const m of allMissions) {
    const order = (orderByLang.get(m.lang) ?? 0) + 1;
    orderByLang.set(m.lang, order);
    const extra = m.extra || m.closingLine ? { ...(m.extra ?? {}), ...(m.closingLine ? { closingLine: m.closingLine } : {}) } : undefined;
    const data = {
      mode: m.mode ?? 'MISSION',
      title: m.title,
      description: m.description,
      objective: m.objective,
      scenario: m.scenario,
      cefrLevel: m.level as CEFRLevel,
      difficulty: m.difficulty,
      requiredSkills: m.skills as LearningSkill[],
      estimatedMinutes: m.minutes,
      xpReward: m.xp ?? 100,
      keyPhrases: json(m.keyPhrases.map(([term, translation]) => ({ term, translation }))),
      grammarFocus: m.grammarFocus ?? null,
      criteria: json(m.criteria),
      openingLine: m.opening,
      extra: extra ? json(extra) : Prisma.JsonNull,
      order,
      environmentId: envIds.get(m.env) ?? null,
      characterId: characterIds.get(m.character) ?? null,
      storyId: m.story ? story.id : null,
      chapter: m.chapter ?? null,
    };
    await prisma.mission.upsert({
      where: { languageCode_slug: { languageCode: m.lang, slug: m.slug } },
      update: data,
      create: { slug: m.slug, languageCode: m.lang, ...data },
    });
  }
  log(`${allMissions.length} missions`);

  let words = 0;
  for (const [lang, rows] of Object.entries(VOCABULARY)) {
    for (const [word, article, plural, translation, category, level, example, pos] of rows) {
      const display = article ? `${article}${article.endsWith("'") ? '' : ' '}${word}` : word;
      const normalizedWord = display.trim().toLowerCase();
      const data = {
        word: display,
        translation,
        partOfSpeech: pos,
        exampleSentence: example,
        article,
        plural,
        category,
        difficulty: difficultyFor(level),
      };
      await prisma.vocabulary.upsert({
        where: { languageCode_normalizedWord_level: { languageCode: lang, normalizedWord, level: level as CEFRLevel } },
        update: data,
        create: { languageCode: lang, normalizedWord, level: level as CEFRLevel, ...data },
      });
      words++;
    }
  }
  log(`${words} vocabulary items`);

  let exercises = 0;
  const topicOrder = new Map<string, number>();
  for (const g of GRAMMAR) {
    const order = (topicOrder.get(g.lang) ?? 0) + 1;
    topicOrder.set(g.lang, order);
    const data = {
      cefrLevel: g.level as CEFRLevel,
      title: g.title,
      summary: g.summary,
      explanation: g.explanation,
      examples: json(g.examples),
      practicePrompt: g.practicePrompt,
      order,
    };
    const topic = await prisma.grammarTopic.upsert({
      where: { languageCode_slug: { languageCode: g.lang, slug: g.slug } },
      update: data,
      create: { languageCode: g.lang, slug: g.slug, ...data },
    });
    const existing = await prisma.practiceExercise.count({ where: { grammarTopicId: topic.id } });
    if (existing === 0) {
      await prisma.practiceExercise.createMany({
        data: g.exercises.map((e, i) => ({
          languageCode: g.lang,
          cefrLevel: g.level as CEFRLevel,
          type: e.type,
          skill: (e.skill ?? 'GRAMMAR') as LearningSkill,
          prompt: e.prompt,
          payload: json(e.payload),
          explanation: e.explanation ?? null,
          difficulty: difficultyFor(g.level),
          // The first auto-gradable item of every topic doubles as a placement question.
          isPlacement: i === 0 && ['MULTIPLE_CHOICE', 'FILL_BLANK'].includes(e.type),
          grammarTopicId: topic.id,
        })),
      });
    }
    exercises += g.exercises.length;
  }
  log(`${GRAMMAR.length} grammar topics, ${exercises} exercises`);

  let challenges = 0;
  for (const l of LANGUAGES) {
    const existing = await prisma.challengeTemplate.count({ where: { languageCode: l.code } });
    if (existing > 0) continue;
    const rows = (Object.entries(CHALLENGE_PROMPTS) as [Level, { focus: string; prompt: string }[]][]).flatMap(([level, prompts]) =>
      prompts.map((p) => ({ languageCode: l.code, cefrLevel: level as CEFRLevel, focus: p.focus, prompt: p.prompt.replace('{lang}', l.name) })),
    );
    await prisma.challengeTemplate.createMany({ data: rows });
    challenges += rows.length;
  }
  log(`${challenges} new challenge templates`);

  const lessons = await seedCurriculum(prisma, levelIds);
  log(`${lessons} curriculum lessons`);

  await prisma.systemSetting.upsert({
    where: { key: 'xp.rewards' },
    update: {},
    create: { key: 'xp.rewards', value: json({ lesson: 50, mission: 100, speaking: 75, daily_challenge: 100, test: 200, level: 500 }) },
  });
  const flags = [
    { key: 'immersion.speaking', description: 'Browser speech recognition & synthesis in missions', enabled: true },
    { key: 'immersion.chaos', description: 'Chaos mode', enabled: true },
    { key: 'immersion.story', description: 'Story mode', enabled: true },
    { key: 'immersion.debate', description: 'Debate mode', enabled: true },
    { key: 'immersion.journal', description: 'AI journal', enabled: true },
  ];
  for (const f of flags) {
    await prisma.featureFlag.upsert({ where: { key: f.key }, update: {}, create: f });
  }
}

async function seedCurriculum(prisma: PrismaClient, levelIds: Map<Level, string>) {
  const vocabByKey = new Map<string, { word: string; translation: string; example: string }[]>();
  for (const [lang, rows] of Object.entries(VOCABULARY)) {
    for (const [word, article, , translation, category, level, example] of rows) {
      const key = `${lang}|${level}|${category}`;
      const list = vocabByKey.get(key) ?? [];
      list.push({ word: article ? `${article}${article.endsWith("'") ? '' : ' '}${word}` : word, translation, example });
      vocabByKey.set(key, list);
    }
  }
  const pickWords = (lang: string, level: Level, category: string, offset: number) => {
    const exact = vocabByKey.get(`${lang}|${level}|${category}`) ?? [];
    const fallback = [...vocabByKey.entries()].filter(([k]) => k.startsWith(`${lang}|${level}|`)).flatMap(([, v]) => v);
    const pool = exact.length >= 4 ? exact : [...exact, ...fallback];
    if (pool.length === 0) return [];
    return Array.from({ length: Math.min(6, pool.length) }, (_, i) => pool[(offset + i) % pool.length]!);
  };

  const courses: { lang: string; level: Level; modules: ModuleTheme[] }[] = [
    ...(Object.entries(CURRICULUM_DE) as [Level, ModuleTheme[]][]).map(([level, modules]) => ({ lang: 'de', level, modules })),
    ...Object.entries(CURRICULUM_INTL).map(([lang, modules]) => ({ lang, level: 'A1' as Level, modules })),
  ];

  let count = 0;
  for (const c of courses) {
    const levelId = levelIds.get(c.level)!;
    const language = LANGUAGES.find((l) => l.code === c.lang)!;
    const slug = `${c.lang}-${c.level.toLowerCase()}-curriculum`;
    // Order 10 keeps clear of the legacy hand-written sample course (order 1).
    const course = await prisma.course.upsert({
      where: { slug },
      update: {},
      create: {
        levelId,
        languageCode: c.lang,
        slug,
        title: `${language.name} ${c.level}`,
        description: LEVELS.find((l) => l.code === c.level)!.description,
        order: 10,
      },
    });

    for (const [mi, m] of c.modules.entries()) {
      const mod = await prisma.module.upsert({
        where: { courseId_slug: { courseId: course.id, slug: m.slug } },
        update: { title: m.title, description: m.goal },
        create: { courseId: course.id, slug: m.slug, title: m.title, description: m.goal, order: mi + 1 },
      });
      for (const [li, plan] of LESSON_PLAN.entries()) {
        const lessonSlug = `${c.lang}-${c.level.toLowerCase()}-${m.slug}-${plan.suffix}`;
        const content = {
          version: 1,
          goal: m.goal,
          vocabulary: pickWords(c.lang, c.level, m.vocab, mi * 3 + li),
          grammarTopic: m.grammar,
          reading: { text: m.text, gloss: m.gloss || null },
          speakingPrompt: m.speaking,
          writingPrompt: m.writing,
          missionSlug: m.mission ?? null,
          aiBrief: `Practise "${m.title}" at ${c.level}: ${m.goal} Focus: ${m.grammar.replace(/-/g, ' ')}.`,
        };
        await prisma.lesson.upsert({
          where: { slug: lessonSlug },
          update: {},
          create: {
            moduleId: mod.id,
            slug: lessonSlug,
            title: plan.title(m),
            description: m.goal,
            skill: plan.skill,
            difficulty: difficultyFor(c.level),
            estimatedMinutes: plan.minutes,
            order: li + 1,
            objectives: [m.goal, plan.skill === 'SPEAKING' ? m.speaking : plan.skill === 'GRAMMAR' ? `Use ${m.grammar.replace(/-/g, ' ')} correctly` : `Understand ${m.title.toLowerCase()} vocabulary`],
            content: json(content),
          },
        });
        count++;
      }
    }
  }
  return count;
}
