import groupsData from '../data/groups.json';
import type { BracketDraft, GroupId, GroupPicks } from '../types/domain';
import { GROUP_IDS } from '../types/domain';

const STORAGE_KEY = 'wc2026-bracket:draft:v1';
const SCHEMA_VERSION = 1 as const;

export function defaultGroupPicks(): GroupPicks {
  const raw = groupsData.groups as Record<GroupId, string[]>;
  const out = {} as GroupPicks;
  for (const id of GROUP_IDS) {
    const ordered = raw[id] ?? [];
    out[id] = [
      ordered[0] ?? '',
      ordered[1] ?? '',
      ordered[2] ?? '',
      ordered[3] ?? '',
    ];
  }
  return out;
}

export function createInitialDraft(): BracketDraft {
  return {
    schemaVersion: SCHEMA_VERSION,
    displayName: '',
    groupPicks: defaultGroupPicks(),
    thirdPlaceAdvancers: [],
    knockoutPicks: {},
    finalScore: { home: null, away: null },
  };
}

export function loadDraft(): BracketDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BracketDraft>;
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
    return {
      ...createInitialDraft(),
      ...parsed,
      schemaVersion: SCHEMA_VERSION,
    } as BracketDraft;
  } catch {
    return null;
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
export function saveDraftDebounced(draft: BracketDraft, delayMs = 150): void {
  if (typeof window === 'undefined') return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // swallow — quota errors aren't actionable
    }
  }, delayMs);
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
