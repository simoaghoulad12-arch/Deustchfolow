import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { UserRole } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { getTutorReviews } from '@/lib/api/reviews';

export const metadata: Metadata = { title: 'Bewertungen – DeutschFlow' };

export default async function TutorReviewsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== UserRole.TUTOR) redirect('/dashboard');

  const reviews = await getTutorReviews(session, session.id);
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Bewertungen</h1>
        <p className="text-sm text-muted-foreground">Was deine Schüler:innen über dich sagen.</p>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="text-xs uppercase text-muted-foreground">Durchschnitt</p>
        <p className="mt-1 text-xl font-semibold">
          {averageRating !== null ? `★ ${averageRating.toFixed(1)} (${reviews.length})` : 'Noch keine Bewertungen'}
        </p>
      </div>

      {reviews.length === 0 && (
        <p className="text-sm text-muted-foreground">Noch keine Bewertungen erhalten.</p>
      )}

      <ul className="space-y-2">
        {reviews.map((review) => (
          <li key={review.id} className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </span>
              <span className="text-xs text-muted-foreground">
                {review.student.profile?.displayName ?? 'Schüler:in'}
              </span>
            </div>
            {review.comment && <p className="mt-2 text-sm">{review.comment}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
