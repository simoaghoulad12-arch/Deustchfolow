'use client';

import { useState } from 'react';
import {
  CONTENT_TYPES,
  CTAS,
  POSTING_CHECKLIST,
  QUALITY_CHECK,
  RATINGS,
  RATING_LABELS,
  REEL_SLOTS,
  SCORE_CATEGORIES,
  checkKey,
  defaultCtaForSlot,
  newReelReview,
  postingReadiness,
  type ReelReview,
} from '@/lib/manager';
import { cn } from '@/lib/cn';
import { useManagerStore } from './useManagerStore';

/**
 * One review per reel: quality check by group, per-category rating (no
 * overall score), Must Fix list and the posting checklist. "Bereit zum
 * Posten" only appears when postingReadiness() finds no blockers.
 */
export function ReelReviewer() {
  const { state, ready, update } = useManagerStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = state.reviews.find((r) => r.id === openId) ?? null;

  function add() {
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    update((prev) => ({
      ...prev,
      reviews: [newReelReview(id, new Date().toISOString()), ...prev.reviews],
    }));
    setOpenId(id);
  }

  function change(id: string, fn: (r: ReelReview) => ReelReview) {
    update((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) => (r.id === id ? fn(r) : r)),
    }));
  }

  function remove(id: string) {
    if (!window.confirm('نمسح هاد المراجعة؟')) return;
    update((prev) => ({ ...prev, reviews: prev.reviews.filter((r) => r.id !== id) }));
    setOpenId(null);
  }

  return (
    <div>
      <button type="button" onClick={add} disabled={!ready} className="btn-solid w-full sm:w-auto">
        راجع ريل جديد
      </button>

      {state.reviews.length > 0 && (
        <ul className="mt-6 border-t border-white/[0.07]">
          {state.reviews.map((r) => {
            const { ready: canPost, blockers } = postingReadiness(r);
            return (
              <li key={r.id} className="border-b border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setOpenId(openId === r.id ? null : r.id)}
                  aria-expanded={openId === r.id}
                  className="flex min-h-[52px] w-full items-center justify-between gap-4 py-3 text-start"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{r.title || 'بلا عنوان'}</span>
                    <span className="tech mt-1 block text-fog">
                      {r.slot ? `السلوت ${r.slot}` : 'بلا سلوت'} · {r.cta ?? 'بلا CTA'}
                    </span>
                  </span>
                  <span className={cn('tech shrink-0', canPost ? 'text-gold' : 'text-fog')}>
                    {canPost ? 'واجد للنشر' : `${blockers.length} مازال`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {open && <ReviewEditor review={open} change={change} remove={remove} />}
    </div>
  );
}

function ReviewEditor({
  review,
  change,
  remove,
}: {
  review: ReelReview;
  change: (id: string, fn: (r: ReelReview) => ReelReview) => void;
  remove: (id: string) => void;
}) {
  const set = (fn: (r: ReelReview) => ReelReview) => change(review.id, fn);
  const { ready, blockers } = postingReadiness(review);
  const slot = REEL_SLOTS.find((s) => s.slot === review.slot);

  function toggleCheck(key: string) {
    set((r) => ({
      ...r,
      checks: r.checks.includes(key) ? r.checks.filter((k) => k !== key) : [...r.checks, key],
    }));
  }

  return (
    <div className="mt-8 border border-white/10 p-4 sm:p-6">
      <label className="block">
        <span className="label text-mist">الريل (الفكرة فجملة وحدة)</span>
        <input
          value={review.title}
          onChange={(e) => set((r) => ({ ...r, title: e.target.value }))}
          className="mt-2 h-14 w-full border border-white/10 bg-transparent px-4 text-ivory focus:border-accent focus:outline-none"
        />
      </label>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="label text-mist">السلوت</span>
          <select
            value={review.slot ?? ''}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : null;
              set((r) => ({
                ...r,
                slot: value,
                cta: value && !r.cta ? defaultCtaForSlot(value) : r.cta,
              }));
            }}
            className="mt-2 h-14 w-full border border-white/10 bg-ink px-3 text-sm text-ivory focus:border-accent focus:outline-none"
          >
            <option value="">–</option>
            {REEL_SLOTS.map((s) => (
              <option key={s.slot} value={s.slot}>
                {s.slot}: {s.topic}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label text-mist">CTA</span>
          <select
            value={review.cta ?? ''}
            onChange={(e) =>
              set((r) => ({ ...r, cta: (e.target.value || null) as ReelReview['cta'] }))
            }
            className="mt-2 h-14 w-full border border-white/10 bg-ink px-3 text-sm text-ivory focus:border-accent focus:outline-none"
          >
            <option value="">–</option>
            {CTAS.map((c) => (
              <option key={c} value={c}>
                {c}
                {slot && !slot.ctas.includes(c) ? ' (ماكيناسبش السلوت)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label text-mist">النوع</span>
          <select
            value={review.contentType ?? ''}
            onChange={(e) =>
              set((r) => ({
                ...r,
                contentType: (e.target.value || null) as ReelReview['contentType'],
              }))
            }
            className="mt-2 h-14 w-full border border-white/10 bg-ink px-3 text-sm text-ivory focus:border-accent focus:outline-none"
          >
            <option value="">–</option>
            {CONTENT_TYPES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {slot && <p className="mt-3 font-display text-lg italic text-ivory/70">{slot.hook}</p>}

      <h4 className="label mt-10 text-gold">تشيك الجودة</h4>
      <div className="mt-4 border-t border-white/[0.07]">
        {QUALITY_CHECK.map((g) => {
          const done = g.items.filter((_, i) => review.checks.includes(checkKey(g.id, i))).length;
          return (
            <details key={g.id} className="group border-b border-white/[0.07]">
              <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 py-3">
                <span className="text-sm">
                  {g.title}
                  {g.note && <span className="ms-2 text-xs text-fog">{g.note}</span>}
                </span>
                <span className={cn('tech', done === g.items.length ? 'text-gold' : 'text-fog')}>
                  {done}/{g.items.length}
                </span>
              </summary>
              <ul className="pb-4">
                {g.items.map((item, i) => {
                  const key = checkKey(g.id, i);
                  return (
                    <li key={key}>
                      <label className="flex cursor-pointer items-start gap-3 py-2">
                        <input
                          type="checkbox"
                          checked={review.checks.includes(key)}
                          onChange={() => toggleCheck(key)}
                          className="mt-0.5 h-5 w-5 shrink-0 accent-[rgb(var(--accent))]"
                        />
                        <span className="text-sm leading-relaxed text-mist">{item}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>

      <h4 className="label mt-10 text-gold">السكور لكل كاتيغوري</h4>
      <ul className="mt-4 grid gap-px bg-white/[0.07] sm:grid-cols-2">
        {SCORE_CATEGORIES.map((c) => (
          <li key={c.id} className="flex flex-col gap-2 bg-ink py-3 sm:pe-4">
            <span className="text-sm">{c.label}</span>
            <span className="grid grid-cols-4 gap-1" role="radiogroup" aria-label={c.label}>
              {RATINGS.map((rating) => {
                const active = review.scores[c.id] === rating;
                return (
                  <button
                    key={rating}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() =>
                      set((r) => ({
                        ...r,
                        scores: { ...r.scores, [c.id]: active ? undefined : rating },
                      }))
                    }
                    className={cn(
                      'tech min-h-[40px] border px-1 transition-colors',
                      active
                        ? rating === 'change'
                          ? 'border-ivory bg-ivory text-ink'
                          : 'border-accent text-accent'
                        : 'border-white/10 text-fog hover:border-white/30',
                    )}
                  >
                    {RATING_LABELS[rating]}
                  </button>
                );
              })}
            </span>
          </li>
        ))}
      </ul>

      <label className="mt-10 block">
        <span className="label text-gold">Must Fix</span>
        <span className="mt-1 block text-xs text-fog">
          تبديل واحد فكل سطر. اللي سالا: بدا السطر بـ [x].
        </span>
        <textarea
          value={review.mustFix}
          onChange={(e) => set((r) => ({ ...r, mustFix: e.target.value }))}
          rows={4}
          className="mt-2 w-full border border-white/10 bg-transparent p-4 text-sm text-ivory focus:border-accent focus:outline-none"
        />
      </label>

      <h4 className="label mt-10 text-gold">ليستة النشر</h4>
      <ul className="mt-4 grid gap-x-6 sm:grid-cols-2">
        {POSTING_CHECKLIST.map((item, i) => (
          <li key={item}>
            <label className="flex cursor-pointer items-start gap-3 py-2">
              <input
                type="checkbox"
                checked={review.posting.includes(i)}
                onChange={() =>
                  set((r) => ({
                    ...r,
                    posting: r.posting.includes(i)
                      ? r.posting.filter((p) => p !== i)
                      : [...r.posting, i],
                  }))
                }
                className="mt-0.5 h-5 w-5 shrink-0 accent-[rgb(var(--accent))]"
              />
              <span className="text-sm text-mist">{item}</span>
            </label>
          </li>
        ))}
      </ul>

      <div
        className={cn('mt-10 border p-4', ready ? 'border-gold/60' : 'border-white/10')}
        aria-live="polite"
      >
        <p className={cn('label', ready ? 'text-gold' : 'text-ivory')}>
          {ready ? 'واجد للنشر' : 'مازال ماتنشرش'}
        </p>
        {!ready && (
          <ul className="mt-3 grid gap-1 text-sm text-mist">
            {blockers.map((b) => (
              <li key={b} className="flex gap-3">
                <span className="text-gold">·</span>
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => remove(review.id)}
        className="label mt-6 py-3 text-fog hover:text-ivory"
      >
        مسح المراجعة
      </button>
    </div>
  );
}
