'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { isLang, isTheme, LANG_COOKIE, THEME_COOKIE } from '@/lib/i18n';

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setLanguage(formData: FormData) {
  const lang = formData.get('lang');
  if (!isLang(lang)) return;
  cookies().set(LANG_COOKIE, lang, { maxAge: ONE_YEAR, sameSite: 'lax', path: '/' });
  revalidatePath('/', 'layout');
}

export async function setTheme(formData: FormData) {
  const theme = formData.get('theme');
  if (!isTheme(theme)) return;
  cookies().set(THEME_COOKIE, theme, { maxAge: ONE_YEAR, sameSite: 'lax', path: '/' });
  revalidatePath('/', 'layout');
}
