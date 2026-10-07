'use client';

import { useEffect } from 'react';

/** Meldet den Service Worker an (nur im Produktions-Build; im Entwicklungsmodus störend). */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }, []);
  return null;
}
