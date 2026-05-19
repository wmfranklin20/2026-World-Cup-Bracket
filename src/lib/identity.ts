import type { Identity } from '../types/domain';

const STORAGE_KEY = 'wc2026-bracket:identity:v1';
const SCHEMA_VERSION = 1 as const;
export const MAX_BRACKETS_PER_IDENTITY = 2;

interface StoredIdentity extends Identity {
  schemaVersion: typeof SCHEMA_VERSION;
}

export function loadIdentity(): Identity | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredIdentity>;
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
    const displayName = (parsed.displayName ?? '').trim();
    const email = (parsed.email ?? '').trim();
    if (!displayName || !email) return null;
    return {
      displayName,
      email,
      submittedCount: Math.max(0, Number(parsed.submittedCount ?? 0)),
    };
  } catch {
    return null;
  }
}

export function saveIdentity(identity: Identity): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredIdentity = {
      ...identity,
      schemaVersion: SCHEMA_VERSION,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota errors
  }
}

export function clearIdentity(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
