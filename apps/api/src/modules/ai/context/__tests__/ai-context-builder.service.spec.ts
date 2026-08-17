import { AiContextBuilder } from '../ai-context-builder.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';

function buildPrismaMock(overrides?: {
  learningProfile?: { currentLevel: string; targetLevel: string | null; learningGoal: string | null } | null;
  lesson?: { title: string; skill: string } | null;
  weakSkillRows?: Array<{ skill: string }>;
  writingSubmissions?: Array<{ errors: unknown }>;
}) {
  return {
    client: {
      learningProfile: {
        findUnique: jest.fn().mockResolvedValue(overrides?.learningProfile ?? null),
      },
      lesson: {
        findUnique: jest.fn().mockResolvedValue(overrides?.lesson ?? null),
      },
      userSkillProgress: {
        findMany: jest.fn().mockResolvedValue(overrides?.weakSkillRows ?? []),
      },
      writingSubmission: {
        findMany: jest.fn().mockResolvedValue(overrides?.writingSubmissions ?? []),
      },
    },
  } as unknown as PrismaService;
}

describe('AiContextBuilder', () => {
  it('defaults to A1 and empty signals when the user has no learning profile yet', async () => {
    const prisma = buildPrismaMock();
    const builder = new AiContextBuilder(prisma);

    const context = await builder.build('user-1');

    expect(context).toEqual({
      userId: 'user-1',
      currentLevel: 'A1',
      targetLevel: null,
      learningGoal: null,
      currentSkill: null,
      currentLessonTitle: null,
      weakSkills: [],
      recentErrorCategories: [],
    });
  });

  it('only queries the lesson table when a lessonId is given', async () => {
    const prisma = buildPrismaMock();
    const builder = new AiContextBuilder(prisma);

    await builder.build('user-1');
    expect(prisma.client.lesson.findUnique).not.toHaveBeenCalled();

    await builder.build('user-1', { lessonId: 'lesson-1' });
    expect(prisma.client.lesson.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'lesson-1' } }),
    );
  });

  it('carries through the learner profile level/goal and current lesson skill', async () => {
    const prisma = buildPrismaMock({
      learningProfile: { currentLevel: 'B1', targetLevel: 'B2', learningGoal: 'Beruf in Deutschland' },
      lesson: { title: 'Der Konjunktiv II', skill: 'GRAMMAR' },
      weakSkillRows: [{ skill: 'GRAMMAR' }, { skill: 'WRITING' }],
    });
    const builder = new AiContextBuilder(prisma);

    const context = await builder.build('user-1', { lessonId: 'lesson-1' });

    expect(context.currentLevel).toBe('B1');
    expect(context.targetLevel).toBe('B2');
    expect(context.learningGoal).toBe('Beruf in Deutschland');
    expect(context.currentSkill).toBe('GRAMMAR');
    expect(context.currentLessonTitle).toBe('Der Konjunktiv II');
    expect(context.weakSkills).toEqual(['GRAMMAR', 'WRITING']);
  });

  it('extracts a deduplicated list of recent error categories, capped at 5', async () => {
    const prisma = buildPrismaMock({
      writingSubmissions: [
        { errors: [{ category: 'ARTICLE' }, { category: 'TENSE' }] },
        { errors: [{ category: 'ARTICLE' }, { category: 'WORD_ORDER' }] },
        { errors: [{ category: 'SPELLING' }, { category: 'PREPOSITION' }, { category: 'STYLE' }] },
      ],
    });
    const builder = new AiContextBuilder(prisma);

    const context = await builder.build('user-1');

    expect(context.recentErrorCategories).toHaveLength(5);
    expect(new Set(context.recentErrorCategories).size).toBe(5);
    expect(context.recentErrorCategories).toContain('ARTICLE');
  });

  it('never sends a full user data dump — only the documented AiLearnerContext fields', async () => {
    const prisma = buildPrismaMock({
      learningProfile: { currentLevel: 'A2', targetLevel: null, learningGoal: null },
    });
    const builder = new AiContextBuilder(prisma);

    const context = await builder.build('user-1');

    expect(Object.keys(context).sort()).toEqual(
      [
        'currentLessonTitle',
        'currentLevel',
        'currentSkill',
        'learningGoal',
        'recentErrorCategories',
        'targetLevel',
        'userId',
        'weakSkills',
      ].sort(),
    );
  });
});
