'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useStore } from '@/lib/commerce/store';
import {
  COMMERCE,
  DEFAULT_SHIPPING,
  SHIPPING_METHODS,
  formatPrice,
  getCommerceProvider,
  shippingFor,
} from '@/lib/commerce/provider';
import { cn } from '@/lib/cn';
import { useLocale } from '@/lib/i18n/context';
import { useCopy } from '@/lib/i18n/copy';
import { checkout as copy } from '@/lib/i18n/copy/checkout';
import { lineName, lineVariant } from '@/lib/i18n/cart';

type Notice = { tone: 'info' | 'error'; text: string } | null;

export function CheckoutView() {
  const { lines, subtotalCents, count } = useStore();
  const t = useCopy(copy);
  const locale = useLocale();
  const [shippingId, setShippingId] = useState(DEFAULT_SHIPPING.id);
  const [code, setCode] = useState('');
  const [codeNotice, setCodeNotice] = useState<Notice>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [pending, setPending] = useState(false);

  const method = SHIPPING_METHODS.find((m) => m.id === shippingId) ?? DEFAULT_SHIPPING;
  const shippingCents = shippingFor(method, subtotalCents);
  const totalCents = subtotalCents + (shippingCents ?? 0);
  const shippingLabel = (cents: number | null) =>
    cents === null ? t.confirmedAtLaunch : cents === 0 ? t.free : formatPrice(cents, locale);

  if (lines.length === 0) {
    return (
      <div className="flex min-h-[60svh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-5xl">{t.empty}</h1>
        <Link href="/shop" className="btn-solid mt-8">
          {t.shop}
        </Link>
      </div>
    );
  }

  const applyCode = async () => {
    if (!code.trim()) return;
    const res = await getCommerceProvider().validateDiscount(code.trim());
    setCodeNotice(
      res.ok
        ? { tone: 'info', text: t.applied(res.data.code) }
        : {
            tone: 'error',
            text: res.reason === 'not_configured' ? t.discountOffline : res.message,
          },
    );
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setNotice(null);
    const res = await getCommerceProvider().createCheckout({
      lines,
      shippingId,
      discount: code || undefined,
    });
    setPending(false);
    if (res.ok) {
      window.location.href = res.data.redirectUrl;
    } else {
      setNotice({
        tone: 'error',
        text: res.reason === 'not_configured' ? t.checkoutOffline : res.message,
      });
    }
  };

  return (
    <>
      {!COMMERCE.paymentsEnabled && (
        <div
          role="status"
          className="mb-10 border border-gold/40 bg-gold/[0.06] px-5 py-4 text-sm leading-relaxed text-ivory/85"
        >
          <span className="label me-3 text-gold">{t.previewLabel}</span>
          {t.previewText}
        </div>
      )}

      <h1 className="font-display text-5xl leading-none sm:text-6xl">{t.title}</h1>

      <form onSubmit={submit} className="mt-12 grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <div className="space-y-12">
          <fieldset>
            <legend className="label text-mist">{t.contact}</legend>
            <div className="mt-5 grid gap-3">
              <Field
                label={t.email}
                name="email"
                type="email"
                autoComplete="email"
                dir="ltr"
                required
              />
              <Field
                label={t.phone}
                name="tel"
                type="tel"
                dir="ltr"
                autoComplete="tel"
                inputMode="tel"
                required
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="label text-mist">{t.address}</legend>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Field label={t.firstName} name="given-name" autoComplete="given-name" required />
              <Field label={t.lastName} name="family-name" autoComplete="family-name" required />
              <Field
                label={t.street}
                name="address-line1"
                autoComplete="address-line1"
                required
                className="col-span-2"
              />
              <Field
                label={t.postal}
                dir="ltr"
                name="postal-code"
                autoComplete="postal-code"
                inputMode="numeric"
                required
              />
              <Field label={t.city} name="address-level2" autoComplete="address-level2" required />
              <label className="col-span-2 block">
                <span className="sr-only">{t.country}</span>
                <select
                  name="country"
                  autoComplete="country"
                  className="h-14 w-full border border-white/15 bg-transparent px-4 text-sm text-ivory focus:border-accent focus:outline-none"
                  defaultValue="MA"
                >
                  {Object.entries(t.countries).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="label text-mist">{t.shipping}</legend>
            <div className="mt-5 grid gap-2">
              {SHIPPING_METHODS.map((m) => {
                const price = shippingFor(m, subtotalCents);
                return (
                  <label
                    key={m.id}
                    className={cn(
                      'flex cursor-pointer items-center justify-between border px-4 py-4 text-sm transition-colors',
                      shippingId === m.id ? 'border-ivory' : 'border-white/15',
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={m.id}
                        checked={shippingId === m.id}
                        onChange={() => setShippingId(m.id)}
                        className="accent-[#c9a26b]"
                      />
                      <span>
                        {t.methods[m.id]?.label ?? m.label}
                        <span className="block text-xs text-mist">
                          {t.methods[m.id]?.eta ?? m.eta}
                        </span>
                      </span>
                    </span>
                    <span className="text-end text-xs tabular-nums text-mist">
                      {shippingLabel(price)}
                    </span>
                  </label>
                );
              })}
              <p className="text-xs text-fog">{t.shippingNote}</p>
            </div>
          </fieldset>

          <fieldset>
            <legend className="label text-mist">{t.payment}</legend>
            <div className="mt-5 border border-dashed border-white/15 px-5 py-6 text-sm text-mist">
              {COMMERCE.paymentsEnabled ? t.paymentRedirect : t.paymentPending}
            </div>
          </fieldset>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-white/[0.08] bg-coal p-5 sm:p-7">
            <p className="label text-mist">{t.summary(count)}</p>
            <ul className="mt-6 divide-y divide-white/[0.07]">
              {lines.map((l) => (
                <li key={l.sku} className="flex gap-4 py-4">
                  <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-graphite">
                    <Image src={l.image} alt="" fill sizes="64px" className="object-cover" />
                    <span className="absolute end-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ivory px-1 text-[10px] text-ink">
                      {l.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 justify-between gap-3 text-sm">
                    <div>
                      <p>{lineName(l, locale)}</p>
                      <p className="mt-1 text-xs text-mist">{lineVariant(l, locale)}</p>
                    </div>
                    <p className="tabular-nums">
                      {formatPrice(l.unitPriceCents * l.quantity, locale)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2">
              <label className="flex-1">
                <span className="sr-only">{t.discount}</span>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder={t.discount}
                  className="h-12 w-full border border-white/15 bg-transparent px-4 text-sm uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal placeholder:text-fog focus:border-accent focus:outline-none"
                />
              </label>
              <button type="button" onClick={applyCode} className="btn-line min-h-[48px] px-5">
                {t.apply}
              </button>
            </div>
            {codeNotice && (
              <p
                className={cn(
                  'mt-2 text-xs',
                  codeNotice.tone === 'error' ? 'text-gold' : 'text-mist',
                )}
              >
                {codeNotice.text}
              </p>
            )}

            <dl className="mt-6 space-y-2.5 border-t border-white/[0.07] pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-mist">{t.subtotal}</dt>
                <dd className="tabular-nums">{formatPrice(subtotalCents, locale)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist">{t.shippingRow}</dt>
                <dd className="text-end tabular-nums">{shippingLabel(shippingCents)}</dd>
              </div>
              <div className="flex justify-between border-t border-white/[0.07] pt-3 text-base">
                <dt>{shippingCents === null ? t.totalExcl : t.total}</dt>
                <dd className="tabular-nums">{formatPrice(totalCents, locale)}</dd>
              </div>
            </dl>

            <button
              type="submit"
              disabled={pending}
              className="btn-solid mt-6 w-full disabled:opacity-60"
            >
              {COMMERCE.paymentsEnabled
                ? pending
                  ? t.connecting
                  : t.pay(formatPrice(totalCents, locale))
                : t.continueOffline}
            </button>
            {notice && (
              <p role="alert" className="mt-4 text-sm leading-relaxed text-gold">
                {notice.text}
              </p>
            )}
          </div>
        </aside>
      </form>
    </>
  );
}

function Field({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="sr-only">{label}</span>
      <input
        {...props}
        placeholder={label}
        className="h-14 w-full border border-white/15 bg-transparent px-4 text-sm text-ivory placeholder:text-fog focus:border-accent focus:outline-none"
      />
    </label>
  );
}
