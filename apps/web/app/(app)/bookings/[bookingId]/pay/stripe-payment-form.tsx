'use client';

import { type FormEvent, useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
// Loaded once per page load, not per render — loadStripe() itself is
// idempotent/cached, but there is no reason to call it more than once.
const stripePromise: Promise<Stripe | null> | null = publishableKey ? loadStripe(publishableKey) : null;

function PayButton({ bookingId }: { bookingId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    // On success Stripe redirects the browser to return_url itself —
    // this only returns if confirmation failed client-side (e.g. a
    // declined card) before any redirect happened. The booking's actual
    // status is never set from this response; only the webhook-driven
    // BookingPaymentService.upsertFromPaymentIntent does that.
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/bookings?confirmed=payment&bookingId=${encodeURIComponent(bookingId)}`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Zahlung fehlgeschlagen. Bitte versuche es erneut.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <FormMessage type="error">{error}</FormMessage>}
      <Button type="submit" disabled={!stripe || submitting} className="w-full">
        {submitting ? 'Wird verarbeitet…' : 'Jetzt bezahlen'}
      </Button>
    </form>
  );
}

export function StripePaymentForm({ clientSecret, bookingId }: { clientSecret: string; bookingId: string }) {
  if (!stripePromise) {
    return (
      <FormMessage type="error">
        Zahlungsformular konnte nicht geladen werden — Stripe ist auf dieser Umgebung nicht konfiguriert.
      </FormMessage>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PayButton bookingId={bookingId} />
    </Elements>
  );
}
