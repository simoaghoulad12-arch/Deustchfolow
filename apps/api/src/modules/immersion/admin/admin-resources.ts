import { z } from 'zod';

/**
 * Admin CMS resource registry (spec section 32). Every content type the
 * platform uses is declared once here — model, validation, search fields
 * and who may edit it — and served by one generic controller, so adding a
 * content type to the CMS is a registry entry, not a new endpoint.
 */
const level = z.enum(['A1', 'A2', 'B1', 'B2', 'C1']);
const lang = z.string().regex(/^[a-z]{2}$/);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
const skill = z.enum(['GRAMMAR', 'VOCABULARY', 'READING', 'LISTENING', 'WRITING', 'SPEAKING']);
const text = (max: number) => z.string().trim().min(1).max(max);
const json = z.unknown().refine((v) => v !== undefined, 'Required');
const uuid = z.string().uuid();

export interface AdminResource {
  key: string;
  label: string;
  model: string;
  idField: 'id' | 'key' | 'code';
  schema: z.ZodObject<z.ZodRawShape>;
  search: string[];
  orderBy: Record<string, 'asc' | 'desc'>[];
  /** Columns the list view shows. */
  columns: string[];
  adminOnly?: boolean;
  /** Creation disabled (rows are created by the system, e.g. curriculum lessons). */
  readOnlyCreate?: boolean;
  /** Derives computed columns before writing. */
  prepare?: (data: Record<string, unknown>) => Record<string, unknown>;
}

const criterion = z.object({
  id: text(40),
  description: text(200),
  keywords: z.array(z.string().max(60)).max(30),
  pattern: z.string().max(200),
  example: z.string().max(300),
  npcPrompt: z.string().max(300),
  npcReaction: z.string().max(300),
});

export const ADMIN_RESOURCES: AdminResource[] = [
  {
    key: 'missions',
    label: 'Missions',
    model: 'mission',
    idField: 'id',
    search: ['title', 'slug'],
    orderBy: [{ languageCode: 'asc' }, { cefrLevel: 'asc' }, { order: 'asc' }],
    columns: ['title', 'slug', 'languageCode', 'mode', 'cefrLevel', 'isActive'],
    schema: z.object({
      slug,
      languageCode: lang,
      mode: z.enum(['MISSION', 'CHAOS', 'STORY', 'DEBATE', 'DAILY']).default('MISSION'),
      title: text(140),
      description: text(600),
      objective: text(600),
      scenario: text(2000),
      cefrLevel: level,
      difficulty: z.number().int().min(1).max(5).default(1),
      requiredSkills: z.array(skill).max(6).default([]),
      estimatedMinutes: z.number().int().min(1).max(60).default(5),
      xpReward: z.number().int().min(0).max(1000).default(100),
      keyPhrases: z.array(z.object({ term: text(120), translation: text(200) })).max(30).default([]),
      grammarFocus: z.string().max(200).nullable().optional(),
      criteria: z.array(criterion).max(12).default([]),
      openingLine: text(600),
      extra: z.record(z.unknown()).nullable().optional(),
      order: z.number().int().min(0).max(10000).default(0),
      isActive: z.boolean().default(true),
      environmentId: uuid.nullable().optional(),
      characterId: uuid.nullable().optional(),
      storyId: uuid.nullable().optional(),
      chapter: z.number().int().min(1).max(100).nullable().optional(),
    }),
  },
  {
    key: 'vocabulary',
    label: 'Vocabulary',
    model: 'vocabulary',
    idField: 'id',
    search: ['word', 'translation'],
    orderBy: [{ languageCode: 'asc' }, { level: 'asc' }, { word: 'asc' }],
    columns: ['word', 'translation', 'languageCode', 'level', 'category'],
    schema: z.object({
      languageCode: lang,
      word: text(120),
      translation: text(200),
      level,
      partOfSpeech: z.string().max(40).nullable().optional(),
      exampleSentence: z.string().max(400).nullable().optional(),
      article: z.string().max(10).nullable().optional(),
      plural: z.string().max(120).nullable().optional(),
      pronunciation: z.string().max(120).nullable().optional(),
      category: z.string().max(60).nullable().optional(),
      difficulty: z.number().int().min(1).max(5).default(1),
      frequency: z.number().int().min(1).max(5).default(3),
    }),
    prepare: (data) => (typeof data.word === 'string' ? { ...data, normalizedWord: data.word.trim().toLowerCase() } : data),
  },
  {
    key: 'grammar-topics',
    label: 'Grammar topics',
    model: 'grammarTopic',
    idField: 'id',
    search: ['title', 'slug'],
    orderBy: [{ languageCode: 'asc' }, { cefrLevel: 'asc' }, { order: 'asc' }],
    columns: ['title', 'slug', 'languageCode', 'cefrLevel', 'isActive'],
    schema: z.object({
      languageCode: lang,
      slug,
      cefrLevel: level,
      title: text(140),
      summary: text(400),
      explanation: text(8000),
      examples: z.array(z.object({ target: text(300), translation: text(300), note: z.string().max(300).optional() })).max(20).default([]),
      practicePrompt: text(600),
      order: z.number().int().min(0).max(10000).default(0),
      isActive: z.boolean().default(true),
    }),
  },
  {
    key: 'exercises',
    label: 'Exercises',
    model: 'practiceExercise',
    idField: 'id',
    search: ['prompt'],
    orderBy: [{ languageCode: 'asc' }, { cefrLevel: 'asc' }, { createdAt: 'asc' }],
    columns: ['prompt', 'type', 'languageCode', 'cefrLevel', 'isPlacement'],
    schema: z.object({
      languageCode: lang,
      cefrLevel: level,
      type: z.enum([
        'MULTIPLE_CHOICE',
        'FILL_BLANK',
        'SENTENCE_ORDER',
        'TRANSLATION',
        'ERROR_CORRECTION',
        'MATCHING',
        'READING_COMPREHENSION',
        'LISTENING_COMPREHENSION',
        'FREE_WRITING',
        'SPEAKING',
        'CONVERSATION',
      ]),
      skill,
      prompt: text(1000),
      payload: z.record(z.unknown()),
      explanation: z.string().max(1000).nullable().optional(),
      difficulty: z.number().int().min(1).max(5).default(1),
      isPlacement: z.boolean().default(false),
      grammarTopicId: uuid.nullable().optional(),
    }),
  },
  {
    key: 'lessons',
    label: 'Curriculum lessons',
    model: 'lesson',
    idField: 'id',
    search: ['title', 'slug'],
    orderBy: [{ slug: 'asc' }],
    columns: ['title', 'slug', 'skill', 'estimatedMinutes'],
    readOnlyCreate: true,
    schema: z.object({
      title: text(200),
      description: z.string().max(600).nullable().optional(),
      difficulty: z.number().int().min(1).max(5),
      estimatedMinutes: z.number().int().min(1).max(120),
      objectives: z.array(z.string().max(200)).max(10),
      content: z.record(z.unknown()).nullable().optional(),
    }),
  },
  {
    key: 'environments',
    label: 'World environments',
    model: 'worldEnvironment',
    idField: 'id',
    search: ['name', 'slug'],
    orderBy: [{ order: 'asc' }],
    columns: ['icon', 'name', 'slug', 'minLevel', 'isActive'],
    schema: z.object({
      slug,
      name: text(80),
      description: text(400),
      icon: text(16),
      accent: z.string().regex(/^[a-z]+$/).max(20).default('indigo'),
      minLevel: level.default('A1'),
      order: z.number().int().min(0).max(1000).default(0),
      isActive: z.boolean().default(true),
    }),
  },
  {
    key: 'characters',
    label: 'Characters',
    model: 'character',
    idField: 'id',
    search: ['name', 'slug', 'role'],
    orderBy: [{ name: 'asc' }],
    columns: ['avatar', 'name', 'role', 'slug'],
    schema: z.object({
      slug,
      name: text(80),
      role: text(160),
      personality: text(400),
      speakingStyle: text(400),
      avatar: text(500),
      environmentId: uuid.nullable().optional(),
    }),
  },
  {
    key: 'stories',
    label: 'Stories',
    model: 'story',
    idField: 'id',
    search: ['title', 'slug'],
    orderBy: [{ title: 'asc' }],
    columns: ['title', 'slug', 'languageCode', 'cefrLevel', 'isActive'],
    schema: z.object({ slug, languageCode: lang, title: text(140), description: text(600), cefrLevel: level, isActive: z.boolean().default(true) }),
  },
  {
    key: 'achievements',
    label: 'Achievements',
    model: 'achievement',
    idField: 'id',
    search: ['title', 'code'],
    orderBy: [{ order: 'asc' }],
    columns: ['icon', 'title', 'code', 'xpReward'],
    schema: z.object({
      code: slug,
      title: text(100),
      description: text(300),
      icon: text(16),
      xpReward: z.number().int().min(0).max(5000).default(0),
      criteria: z.object({
        metric: z.enum(['missions_completed', 'streak', 'words', 'speaking_sessions', 'speaking_minutes', 'level_reached', 'journal_entries', 'reviews']),
        threshold: z.number().int().min(1).max(100000),
      }),
      order: z.number().int().min(0).max(1000).default(0),
    }),
  },
  {
    key: 'challenges',
    label: 'Daily challenges',
    model: 'challengeTemplate',
    idField: 'id',
    search: ['prompt', 'focus'],
    orderBy: [{ languageCode: 'asc' }, { cefrLevel: 'asc' }],
    columns: ['prompt', 'focus', 'languageCode', 'cefrLevel', 'isActive'],
    schema: z.object({
      languageCode: lang,
      cefrLevel: level,
      focus: z.enum(['speaking', 'grammar', 'vocabulary', 'writing', 'reading', 'listening']),
      prompt: text(500),
      isActive: z.boolean().default(true),
    }),
  },
  {
    key: 'languages',
    label: 'Languages',
    model: 'language',
    idField: 'id',
    search: ['name', 'code'],
    orderBy: [{ order: 'asc' }],
    columns: ['flag', 'name', 'code', 'isTarget', 'isActive'],
    adminOnly: true,
    schema: z.object({
      code: lang,
      name: text(60),
      nativeName: text(60),
      flag: text(16),
      isTarget: z.boolean().default(true),
      isActive: z.boolean().default(true),
      order: z.number().int().min(0).max(1000).default(0),
    }),
  },
  {
    key: 'feature-flags',
    label: 'Feature flags',
    model: 'featureFlag',
    idField: 'key',
    search: ['key'],
    orderBy: [{ key: 'asc' }],
    columns: ['key', 'enabled', 'rollout', 'description'],
    adminOnly: true,
    schema: z.object({
      key: z.string().regex(/^[a-z0-9._-]+$/).max(80),
      enabled: z.boolean().default(false),
      description: z.string().max(300).nullable().optional(),
      rollout: z.number().int().min(0).max(100).default(100),
    }),
  },
  {
    key: 'settings',
    label: 'System settings',
    model: 'systemSetting',
    idField: 'key',
    search: ['key'],
    orderBy: [{ key: 'asc' }],
    columns: ['key', 'value'],
    adminOnly: true,
    schema: z.object({ key: z.string().regex(/^[a-z0-9._-]+$/).max(80), value: json }),
  },
];

export function findResource(key: string): AdminResource | undefined {
  return ADMIN_RESOURCES.find((r) => r.key === key);
}
