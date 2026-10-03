import { readFileSync } from 'fs';
import { join } from 'path';
import {
  CTAS,
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

  it('spells the brand NATYSIMO', () => {
    const source = readFileSync(join(__dirname, '../lib/manager.ts'), 'utf8');
    expect(source).not.toMatch(/NATTYSIMO/);
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
