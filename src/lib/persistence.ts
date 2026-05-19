import groupsData from '../data/groups.json';
import type {
  BracketDraft,
  DraftSlot,
  GroupId,
  GroupPicks,
} from '../types/domain';
import { GROUP_IDS } from '../types/domain';

const STORAGE_KEY = 'wc2026-bracket:state:v2';
const SCHEMA_VERSION = 2 as const;
const DRAFT_SCHEMA_VERSION = 1 as const;

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
    schemaVersion: DRAFT_SCHEMA_VERSION,
    bracketName: '',
    groupPicks: defaultGroupPicks(),
    thirdPlaceAdvancers: [],
    knockoutPicks: {},
    finalScore: { home: null, away: null },
  };
}

export interface PersistedState {
  drafts: [BracketDraft, BracketDraft];
  activeDraftSlot: DraftSlot;
  submittedSlots: [boolean, boolean];
}

function mergeDraft(parsed: Partial<BracketDraft> | undefined): BracketDraft {
  return {
    ...createInitialDraft(),
    ...(parsed ?? {}),
    schemaVersion: DRAFT_SCHEMA_VERSION,
  } as BracketDraft;
}

export function loadPersistedState(): PersistedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      schemaVersion?: number;
      drafts?: Partial<BracketDraft>[];
      activeDraftSlot?: number;
      submittedSlots?: boolean[];
    };
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
    const draftA = mergeDraft(parsed.drafts?.[0]);
    const draftB = mergeDraft(parsed.drafts?.[1]);
    const slot = parsed.activeDraftSlot === 1 ? 1 : 0;
    const submittedSlots: [boolean, boolean] = [
      Boolean(parsed.submittedSlots?.[0]),
      Boolean(parsed.submittedSlots?.[1]),
    ];
    return {
      drafts: [draftA, draftB],
      activeDraftSlot: slot,
      submittedSlots,
    };
  } catch {
    return null;
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
export function savePersistedStateDebounced(
  next: PersistedState,
  delayMs = 150,
): void {
  if (typeof window === 'undefined') return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ schemaVersion: SCHEMA_VERSION, ...next }),
      );
    } catch {
      // swallow — quota errors aren't actionable
    }
  }, delayMs);
}

export function clearPersistedState(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const RESET_MARKER_KEY = 'wc2026-bracket:reset:intro-tutorial';
const IDENTITY_STORAGE_KEY = 'wc2026-bracket:identity:v1';

export function runOneTimeReset(): void {
  if (typeof window === 'undefined') return;
  try {
    if (window.localStorage.getItem(RESET_MARKER_KEY)) return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(IDENTITY_STORAGE_KEY);
    window.localStorage.setItem(RESET_MARKER_KEY, '1');
  } catch {
    // ignore quota/access errors
  }
}
