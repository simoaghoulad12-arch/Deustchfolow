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

type Notice = { tone: 'info' | 'error'; text: string } | null;

export function CheckoutView() {
  const { lines, subtotalCents, count } = useStore();
  const [shippingId, setShippingId] = useState(DEFAULT_SHIPPING.id);
  const [code, setCode] = useState('');
  const [codeNotice, setCodeNotice] = useState<Notice>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [pending, setPending] = useState(false);

  const method = SHIPPING_METHODS.find((m) => m.id === shippingId) ?? DEFAULT_SHIPPING;
  const shippingCents = shippingFor(method, subtotalCents);
  const totalCents = subtotalCents + (shippingCents ?? 0);
  const shippingLabel = (cents: number | null) =>
    cents === null ? 'Confirmed at launch' : cents === 0 ? 'Free' : formatPrice(cents);

  if (lines.length === 0) {
    return (
      <div className="flex min-h-[60svh] flex-col items-center justify-center text-center">
        <h1 className="font-display text-5xl">Your bag is empty.</h1>
        <Link href="/shop" className="btn-solid mt-8">
          Shop Collection 01
        </Link>
      </div>
    );
  }

  const applyCode = async () => {
    if (!code.trim()) return;
    const res = await getCommerceProvider().validateDiscount(code.trim());
    setCodeNotice(
      res.ok
        ? { tone: 'info', text: `${res.data.code} applied` }
        : { tone: 'error', text: res.message },
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
      setNotice({ tone: 'error', text: res.message });
    }
  };

  return (
    <>
      {!COMMERCE.paymentsEnabled && (
        <div
          role="status"
          className="mb-10 border border-gold/40 bg-gold/[0.06] px-5 py-4 text-sm leading-relaxed text-ivory/85"
        >
          <span className="label mr-3 text-gold">Preview</span>
          The NATYSIMO store is not taking payments yet. You can review your bag and delivery
          options here — no order will be placed and nothing will be charged.
        </div>
      )}

      <h1 className="font-display text-5xl leading-none sm:text-6xl">Checkout</h1>

      <form onSubmit={submit} className="mt-12 grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <div className="space-y-12">
          <fieldset>
            <legend className="label text-mist">01 — Contact</legend>
            <div className="mt-5 grid gap-3">
              <Field label="Email" name="email" type="email" autoComplete="email" required />
              <Field
                label="Phone (for delivery)"
                name="tel"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                required
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="label text-mist">02 — Delivery address</legend>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Field label="First name" name="given-name" autoComplete="given-name" required />
              <Field label="Last name" name="family-name" autoComplete="family-name" required />
              <Field
                label="Street and number"
                name="address-line1"
                autoComplete="address-line1"
                required
                className="col-span-2"
              />
              <Field
                label="Postal code"
                name="postal-code"
                autoComplete="postal-code"
                inputMode="numeric"
                required
              />
              <Field label="City" name="address-level2" autoComplete="address-level2" required />
              <label className="col-span-2 block">
                <span className="sr-only">Country</span>
                <select
                  name="country"
                  autoComplete="country"
                  className="h-14 w-full border border-white/15 bg-transparent px-4 text-sm text-ivory focus:border-accent focus:outline-none"
                  defaultValue="MA"
                >
                  <option value="MA">Morocco</option>
                  <option value="DE">Germany</option>
                  <option value="AT">Austria</option>
                  <option value="NL">Netherlands</option>
                  <option value="BE">Belgium</option>
                  <option value="FR">France</option>
                  <option value="CH">Switzerland</option>
                </select>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="label text-mist">03 — Shipping</legend>
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
                        {m.label}
                        <span className="block text-xs text-mist">{m.eta}</span>
                      </span>
                    </span>
                    <span className="text-right text-xs tabular-nums text-mist">
                      {shippingLabel(price)}
                    </span>
                  </label>
                );
              })}
              <p className="text-xs text-fog">
                Delivery rates and times are confirmed when the store opens. Cash on delivery for
                Morocco is planned for launch.
              </p>
            </div>
          </fieldset>

          <fieldset>
            <legend className="label text-mist">04 — Payment</legend>
            <div className="mt-5 border border-dashed border-white/15 px-5 py-6 text-sm text-mist">
              {COMMERCE.paymentsEnabled
                ? 'You will be redirected to our secure payment partner.'
                : 'Payment methods appear here once the payment provider is connected.'}
            </div>
          </fieldset>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-white/[0.08] bg-coal p-5 sm:p-7">
            <p className="label text-mist">Order summary · {count}</p>
            <ul className="mt-6 divide-y divide-white/[0.07]">
              {lines.map((l) => (
                <li key={l.sku} className="flex gap-4 py-4">
                  <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-graphite">
                    <Image src={l.image} alt="" fill sizes="64px" className="object-cover" />
                    <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ivory px-1 text-[10px] text-ink">
                      {l.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 justify-between gap-3 text-sm">
                    <div>
                      <p>{l.name}</p>
                      <p className="mt-1 text-xs text-mist">
                        {l.color} · {l.size}
                      </p>
                    </div>
                    <p className="tabular-nums">{formatPrice(l.unitPriceCents * l.quantity)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2">
              <label className="flex-1">
                <span className="sr-only">Discount code</span>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Discount code"
                  className="h-12 w-full border border-white/15 bg-transparent px-4 text-sm uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal placeholder:text-fog focus:border-accent focus:outline-none"
                />
              </label>
              <button type="button" onClick={applyCode} className="btn-line min-h-[48px] px-5">
                Apply
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
                <dt className="text-mist">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist">Shipping</dt>
                <dd className="text-right tabular-nums">{shippingLabel(shippingCents)}</dd>
              </div>
              <div className="flex justify-between border-t border-white/[0.07] pt-3 text-base">
                <dt>{shippingCents === null ? 'Total (excl. delivery)' : 'Total'}</dt>
                <dd className="tabular-nums">{formatPrice(totalCents)}</dd>
              </div>
            </dl>

            <button
              type="submit"
              disabled={pending}
              className="btn-solid mt-6 w-full disabled:opacity-60"
            >
              {COMMERCE.paymentsEnabled
                ? pending
                  ? 'Connecting…'
                  : `Pay ${formatPrice(totalCents)}`
                : 'Continue — payments not connected'}
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
