'use client';

import { useMemo } from 'react';
import type { World, WorldId } from '@/lib/brand';
import { useLocale } from './context';
import { localizedWorlds } from './worlds';

/** The three worlds in the visitor's language. */
export function useWorlds(): Record<WorldId, World> {
  const locale = useLocale();
  return useMemo(() => localizedWorlds(locale), [locale]);
}
