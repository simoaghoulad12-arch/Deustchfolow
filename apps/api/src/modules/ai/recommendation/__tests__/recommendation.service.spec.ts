import { RecommendationService } from '../recommendation.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';

function buildPrismaMock(options?: {
  weakestSkillRow?: { skill: string } | null;
  writingSubmissions?: Array<{ errors: unknown }>;
}) {
  return {
    client: {
      userSkillProgress: {
        findFirst: jest.fn().mockResolvedValue(options?.weakestSkillRow ?? null),
      },
      writingSubmission: {
        findMany: jest.fn().mockResolvedValue(options?.writingSubmissions ?? []),
      },
    },
  } as unknown as PrismaService;
}

describe('RecommendationService (rule-based, no AI dependency)', () => {
  it('returns null when there is no weak skill and no recent error pattern', async () => {
    const service = new RecommendationService(buildPrismaMock());

    expect(await service.getRecommendation('user-1')).toBeNull();
  });

  it('combines the weakest skill and the most frequent recent error category', async () => {
    const service = new RecommendationService(
      buildPrismaMock({
        weakestSkillRow: { skill: 'GRAMMAR' },
        writingSubmissions: [
          { errors: [{ category: 'TENSE' }, { category: 'TENSE' }] },
          { errors: [{ category: 'ARTICLE' }] },
        ],
      }),
    );

    const recommendation = await service.getRecommendation('user-1');

    expect(recommendation).toEqual({
      skill: 'GRAMMAR',
      category: 'TENSE',
      message: 'Empfohlen: Grammatik wiederholen — insbesondere Zeitformen.',
    });
  });

  it('falls back to a skill-only recommendation when there is no recent error pattern', async () => {
    const service = new RecommendationService(
      buildPrismaMock({ weakestSkillRow: { skill: 'WRITING' } }),
    );

    const recommendation = await service.getRecommendation('user-1');

    expect(recommendation).toEqual({
      skill: 'WRITING',
      category: null,
      message: 'Empfohlen: Schreiben wiederholen.',
    });
  });

  it('falls back to a category-only recommendation when there is no tracked weak skill', async () => {
    const service = new RecommendationService(
      buildPrismaMock({ writingSubmissions: [{ errors: [{ category: 'SPELLING' }] }] }),
    );

    const recommendation = await service.getRecommendation('user-1');

    expect(recommendation).toEqual({
      skill: null,
      category: 'SPELLING',
      message: 'Empfohlen: Übungen zu Rechtschreibung wiederholen.',
    });
  });
});
