import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import {
  CTAS,
  DEUTSCH_CONTEXT_ITEM,
  POSTING_CHECKLIST,
  QUALITY_CHECK,
  REVIEW_ANSWER_FORMAT,
  SCORE_CATEGORIES,
  buildReviewPrompt,
  checkKey,
  newReelReview,
  normalizeReview,
  postingReadiness,
  type ReelReview,
  FUNNELS,
  HYBRID_STEPS,
  KPIS,
  NOT_NOW,
  REEL_SLOTS,
  REELS_PER_WEEK,
  isoWeekKey,
} from '@/lib/manager';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';

const ROOT = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

/** A review that passes every rule — tests break it one rule at a time. */
function completeReview(overrides: Partial<ReelReview> = {}): ReelReview {
  return {
    ...newReelReview('t', '2026-10-04T08:00:00.000Z'),
    title: 'النهار 12: ترينينغ من بعد الشيفت ديال العشية',
    slot: 2,
    cta: 'PLAN',
    checks: QUALITY_CHECK.flatMap((g) => g.items.map((_, i) => checkKey(g.id, i))),
    posting: POSTING_CHECKLIST.map((_, i) => i),
    scores: Object.fromEntries(SCORE_CATEGORIES.map((c) => [c.id, 'ok'])),
    mustFix: '[x] قصّر الهوك',
    ...overrides,
  };
}

/** The management system's own rules, kept true in the data that renders /manager. */
describe('manager system', () => {
  it('keeps fitness the core: at least 2 fitness slots, at most 1 Deutsch slot', () => {
    const required = REEL_SLOTS.filter((r) => !r.optional);
    expect(required.length).toBeGreaterThanOrEqual(REELS_PER_WEEK.min);
    expect(REEL_SLOTS.length).toBeLessThanOrEqual(REELS_PER_WEEK.max);
    expect(REEL_SLOTS.filter((r) => r.kind === 'fitness').length).toBeGreaterThanOrEqual(
      REELS_PER_WEEK.minFitness,
    );
    expect(REEL_SLOTS.filter((r) => r.kind === 'deutsch').length).toBeLessThanOrEqual(
      REELS_PER_WEEK.maxDeutsch,
    );
  });

  it('gives every reel a CTA that has a DM funnel', () => {
    const funnels = new Set(FUNNELS.map((f) => f.keyword));
    for (const r of REEL_SLOTS) {
      expect(r.ctas.length).toBeGreaterThan(0);
      for (const c of r.ctas) expect(funnels.has(c)).toBe(true);
    }
    expect([...funnels].sort()).toEqual([...CTAS].sort());
  });

  it('brings every funnel to Natty Squad', () => {
    for (const f of FUNNELS) {
      const text = f.steps.map((s) => `${s.step} ${s.text} ${s.snippet ?? ''}`).join(' ');
      expect(text).toMatch(/Squad/);
    }
  });

  it('gives every NICHT JETZT topic a reason and a condition', () => {
    for (const n of NOT_NOW) {
      expect(n.why.trim()).not.toBe('');
      expect(n.allowedWhen.trim()).not.toBe('');
    }
  });

  it('keeps the hybrid programme order fixed', () => {
    expect(HYBRID_STEPS).toHaveLength(10);
    expect(HYBRID_STEPS[4]).toBe('اختبار الطلب');
    expect(HYBRID_STEPS[5]).toContain('Founding Members');
    expect(HYBRID_STEPS[9]).toBe('اللانسمون');
  });

  it('tracks exactly five numbers', () => {
    expect(KPIS).toHaveLength(5);
  });

  it('keeps the two brand names apart: Natty Simo (person), NATYSIMO (clothing)', () => {
    const wrong = /NATTYSIMO|NATTY SIMO|NATTTY|NattySimo/;
    const files = ['lib', 'app', 'components'].flatMap((dir) => sourceFiles(join(ROOT, dir)));
    expect(files.length).toBeGreaterThan(10);
    for (const file of files)
      expect([file, readFileSync(file, 'utf8')]).not.toEqual([file, expect.stringMatching(wrong)]);
    expect(buildReviewPrompt()).not.toMatch(wrong);
  });

  it('computes ISO week keys', () => {
    expect(isoWeekKey(new Date(2026, 9, 4))).toBe('2026-W40'); // Sunday 4 Oct 2026
    expect(isoWeekKey(new Date(2026, 9, 5))).toBe('2026-W41');
    expect(isoWeekKey(new Date(2027, 0, 1))).toBe('2026-W53');
  });
});

describe('/manager stays out of search', () => {
  it('is disallowed in robots.txt', () => {
    const rules = robots().rules;
    const disallow = (Array.isArray(rules) ? rules[0] : rules)?.disallow;
    expect(disallow).toContain('/manager');
  });

  it('is not in the sitemap', () => {
    expect(sitemap().some((e) => e.url.includes('/manager'))).toBe(false);
  });
});

describe('reel quality check', () => {
  it('blocks an empty review', () => {
    const { ready, blockers } = postingReadiness(newReelReview('e', ''));
    expect(ready).toBe(false);
    expect(blockers.join(' ')).toMatch(/ماكاينش CTA/);
  });

  it('lets a fully checked reel post', () => {
    expect(postingReadiness(completeReview())).toEqual({ ready: true, blockers: [] });
  });

  it('blocks a CTA that does not fit the slot', () => {
    expect(postingReadiness(completeReview({ slot: 3, cta: 'PLAN' })).ready).toBe(false);
  });

  it('blocks any category rated "change"', () => {
    const r = completeReview();
    expect(postingReadiness({ ...r, scores: { ...r.scores, hook: 'change' } }).ready).toBe(false);
  });

  it('migrates ratings stored with the old German values', () => {
    const legacy = {
      ...completeReview(),
      scores: { hook: '\u00c4NDERN', story: 'STARK', audio: 'SCHWACH', cta: 'OK', value: 'x' },
    } as unknown as ReelReview;
    expect(normalizeReview(legacy).scores).toEqual({
      hook: 'change',
      story: 'strong',
      audio: 'weak',
      cta: 'ok',
    });
  });

  it('blocks open Must Fix lines and an incomplete posting checklist', () => {
    expect(postingReadiness(completeReview({ mustFix: 'شوف السوتيتر' })).ready).toBe(false);
    expect(postingReadiness(completeReview({ posting: [0, 1, 2] })).ready).toBe(false);
  });

  it('blocks a Deutsch reel without Natty Simo context', () => {
    const r = completeReview({ slot: 4, cta: 'DEUTSCH' });
    expect(postingReadiness(r).ready).toBe(true);
    const deutsch = QUALITY_CHECK.find((g) => g.id === 'deutsch')!;
    const ctx = deutsch.items.indexOf(DEUTSCH_CONTEXT_ITEM);
    expect(ctx).toBeGreaterThanOrEqual(0);
    const without = { ...r, checks: r.checks.filter((k) => k !== checkKey('deutsch', ctx)) };
    expect(postingReadiness(without).blockers.join(' ')).toMatch(/سياق Natty Simo/);
  });

  it('blocks while a protection rule is unchecked', () => {
    const r = completeReview();
    const without = { ...r, checks: r.checks.filter((k) => k !== checkKey('risk', 0)) };
    expect(postingReadiness(without).ready).toBe(false);
  });

  it('builds a review prompt with the full answer format and posting checklist', () => {
    const prompt = buildReviewPrompt();
    for (const step of REVIEW_ANSWER_FORMAT) expect(prompt).toContain(step);
    for (const item of POSTING_CHECKLIST) expect(prompt).toContain(`☐ ${item}`);
    expect(prompt).toContain('Discipline builds freedom.');
  });

  it('asks Claude to answer in Darija, in Arabic script', () => {
    const prompt = buildReviewPrompt();
    expect(prompt).toMatch(/[\u0600-\u06FF]/);
    expect(prompt).toContain('جاوب ديما بالدارجة المغربية بالحروف العربية');
  });
});

describe('/manager is in Darija', () => {
  it('leaves no German behind in the manager data, page or components', () => {
    const files = [
      join(ROOT, 'lib/manager.ts'),
      ...sourceFiles(join(ROOT, 'app/manager')),
      ...sourceFiles(join(ROOT, 'components/manager')),
    ];
    for (const file of files) {
      expect([file, readFileSync(file, 'utf8')]).not.toEqual([
        file,
        expect.stringMatching(/[\u00e4\u00f6\u00fc\u00c4\u00d6\u00dc\u00df]/),
      ]);
    }
  });

  it('renders right-to-left in Arabic', () => {
    const page = readFileSync(join(ROOT, 'app/manager/page.tsx'), 'utf8');
    expect(page).toContain('dir="rtl"');
    expect(page).toContain('lang="ar-MA"');
  });
});
