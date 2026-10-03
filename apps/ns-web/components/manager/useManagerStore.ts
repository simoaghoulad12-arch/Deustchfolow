'use client';

import { useCallback, useEffect, useState } from 'react';
import type { KpiId } from '@/lib/manager';

/**
 * Per-device storage for the /manager page. A convenience only: nothing
 * leaves the browser, and blocked storage simply means an in-memory session.
 */

export const MANAGER_KEY = 'natysimo.manager.v1';
const SYNC_EVENT = 'natysimo:manager';

export type KpiEntry = Partial<Record<KpiId, string>>;

export interface ManagerState {
  /** Checked items per week, e.g. { "2026-W40": ["sunday-0", "start-2"] }. */
  checks: Record<string, string[]>;
  /** The five numbers per week. */
  kpis: Record<string, KpiEntry>;
}

const EMPTY: ManagerState = { checks: {}, kpis: {} };

function read(): ManagerState {
  try {
    const raw = window.localStorage.getItem(MANAGER_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ManagerState>;
    return { checks: parsed.checks ?? {}, kpis: parsed.kpis ?? {} };
  } catch {
    return EMPTY;
  }
}

function storageAvailable(): boolean {
  try {
    const probe = '__natysimo_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function write(value: ManagerState) {
  try {
    window.localStorage.setItem(MANAGER_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable — keep in memory */
  }
}

export function useManagerStore() {
  const [state, setState] = useState<ManagerState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setState(read());
    sync();
    setReady(true);
    window.addEventListener(SYNC_EVENT, sync);
    return () => window.removeEventListener(SYNC_EVENT, sync);
  }, []);

  const update = useCallback((fn: (prev: ManagerState) => ManagerState) => {
    // Several components use this hook on one page: start from what is
    // stored so one doesn't overwrite another's changes, then tell the
    // others to re-read.
    if (storageAvailable()) {
      write(fn(read()));
      window.dispatchEvent(new Event(SYNC_EVENT));
    } else {
      setState(fn);
    }
  }, []);

  return { state, ready, update };
}
