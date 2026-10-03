'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/i18n/context';
import { LOCALE_COOKIE, type Locale } from '@/lib/i18n/locale';
import { cn } from '@/lib/cn';

/** EN | عربي. Writes the language cookie, then re-renders the page in place. */
export function LanguageSwitch({ className }: { className?: string }) {
  const router = useRouter();
  const current = useLocale();

  function choose(next: Locale) {
    if (next === current) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  const item = (locale: Locale, label: string, lang: string) => (
    <button
      type="button"
      lang={lang}
      onClick={() => choose(locale)}
      aria-pressed={current === locale}
      className={cn(
        'min-h-11 px-2 text-[11px] font-medium transition-colors',
        current === locale ? 'text-ivory' : 'text-ivory/50 hover:text-ivory',
      )}
    >
      {label}
    </button>
  );

  return (
    <div
      dir="ltr"
      role="group"
      aria-label="Language / اللغة"
      className={cn('flex items-center', className)}
    >
      {item('en', 'EN', 'en')}
      <span aria-hidden className="text-ivory/25">
        |
      </span>
      {item('ar', 'عربي', 'ar')}
    </div>
  );
}
