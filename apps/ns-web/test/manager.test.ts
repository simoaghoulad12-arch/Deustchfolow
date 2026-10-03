import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import {
  CTAS,
  POSTING_CHECKLIST,
  QUALITY_CHECK,
  REVIEW_ANSWER_FORMAT,
  SCORE_CATEGORIES,
  buildReviewPrompt,
  checkKey,
  newReelReview,
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
    title: 'Tag 12: Training nach der Spätschicht',
    slot: 2,
    cta: 'PLAN',
    checks: QUALITY_CHECK.flatMap((g) => g.items.map((_, i) => checkKey(g.id, i))),
    posting: POSTING_CHECKLIST.map((_, i) => i),
    scores: Object.fromEntries(SCORE_CATEGORIES.map((c) => [c.id, 'OK'])),
    mustFix: '[x] Hook kürzen',
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
    expect(HYBRID_STEPS[4]).toBe('Nachfrage testen');
    expect(HYBRID_STEPS[5]).toBe('Founding Members');
    expect(HYBRID_STEPS[9]).toBe('Launch');
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
    expect(blockers.join(' ')).toMatch(/Kein CTA/);
  });

  it('lets a fully checked reel post', () => {
    expect(postingReadiness(completeReview())).toEqual({ ready: true, blockers: [] });
  });

  it('blocks a CTA that does not fit the slot', () => {
    expect(postingReadiness(completeReview({ slot: 3, cta: 'PLAN' })).ready).toBe(false);
  });

  it('blocks any category rated ÄNDERN', () => {
    const r = completeReview();
    expect(postingReadiness({ ...r, scores: { ...r.scores, hook: 'ÄNDERN' } }).ready).toBe(false);
  });

  it('blocks open Must Fix lines and an incomplete posting checklist', () => {
    expect(postingReadiness(completeReview({ mustFix: 'Untertitel prüfen' })).ready).toBe(false);
    expect(postingReadiness(completeReview({ posting: [0, 1, 2] })).ready).toBe(false);
  });

  it('blocks a Deutsch reel without Natty Simo context', () => {
    const r = completeReview({ slot: 4, cta: 'DEUTSCH' });
    expect(postingReadiness(r).ready).toBe(true);
    const deutsch = QUALITY_CHECK.find((g) => g.id === 'deutsch')!;
    const ctx = deutsch.items.findIndex((i) => i.startsWith('Relevanter Natty-Simo-Kontext'));
    expect(ctx).toBeGreaterThanOrEqual(0);
    const without = { ...r, checks: r.checks.filter((k) => k !== checkKey('deutsch', ctx)) };
    expect(postingReadiness(without).blockers.join(' ')).toMatch(/Natty-Simo-Kontext/);
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
});
