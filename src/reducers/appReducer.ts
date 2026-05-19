import type {
  ActivePage,
  AppState,
  BracketDraft,
  DraftSlot,
  GroupId,
  GroupPicks,
  Identity,
  MatchId,
  OverlayKind,
  TeamId,
  ViewingBracket,
  WizardStep,
} from '../types/domain';
import { GROUP_IDS } from '../types/domain';
import {
  getQFOrder,
  getR16Order,
  getR32Order,
  getSFOrder,
  resolveMatchup,
} from '../lib/bracketSeeding';
import { createInitialDraft } from '../lib/persistence';
import { REQUIRED_THIRD_PLACE } from '../lib/validation';

export type Action =
  | { type: 'SET_ACTIVE_PAGE'; page: ActivePage }
  | { type: 'SET_STEP'; step: WizardStep }
  | {
      type: 'GROUP_REORDER';
      group: GroupId;
      teamId: TeamId;
      toIndex: number;
    }
  | { type: 'TOGGLE_THIRD_PLACE'; group: GroupId }
  | { type: 'SET_KNOCKOUT_WINNER'; matchId: MatchId; teamId: TeamId | null }
  | { type: 'SET_FINAL_SCORE'; home: number | null; away: number | null }
  | { type: 'SET_BRACKET_NAME'; name: string; slot?: DraftSlot }
  | { type: 'SET_ACTIVE_DRAFT'; slot: DraftSlot }
  | { type: 'SET_IDENTITY'; identity: Identity }
  | { type: 'OPEN_BRACKET_VIEW'; view: ViewingBracket }
  | { type: 'CLOSE_BRACKET_VIEW' }
  | { type: 'MARK_SUBMITTED' }
  | { type: 'SET_OVERLAY'; overlay: OverlayKind | null }
  | { type: 'SET_TOAST'; message: string | null }
  | { type: 'SET_SUBMISSION_STATUS'; status: AppState['submission'] }
  | { type: 'RESET' };

export function createInitialState(opts?: {
  drafts?: [BracketDraft, BracketDraft];
  activeDraftSlot?: DraftSlot;
  submittedSlots?: [boolean, boolean];
  identity?: Identity | null;
}): AppState {
  const identity = opts?.identity ?? null;
  const drafts: [BracketDraft, BracketDraft] = opts?.drafts ?? [
    createInitialDraft(),
    createInitialDraft(),
  ];
  const activeDraftSlot: DraftSlot = opts?.activeDraftSlot ?? 0;
  const submittedSlots: [boolean, boolean] = opts?.submittedSlots ?? [
    false,
    false,
  ];
  return {
    activePage: identity ? 'bracket' : 'intro',
    currentStep: 'groups',
    identity,
    draft: drafts[activeDraftSlot],
    drafts,
    activeDraftSlot,
    submittedSlots,
    submission: {
      status: submittedSlots[activeDraftSlot] ? 'submitted' : 'idle',
    },
    toast: null,
    overlay: null,
    viewingBracket: null,
  };
}

function withActiveDraft(
  state: AppState,
  nextDraft: BracketDraft,
  extras: Partial<AppState> = {},
): AppState {
  const drafts: [BracketDraft, BracketDraft] = [...state.drafts] as [
    BracketDraft,
    BracketDraft,
  ];
  drafts[state.activeDraftSlot] = nextDraft;
  return { ...state, draft: nextDraft, drafts, ...extras };
}

function reorderGroup(
  picks: GroupPicks,
  group: GroupId,
  teamId: TeamId,
  toIndex: number,
): GroupPicks {
  const current = picks[group];
  const fromIndex = current.indexOf(teamId);
  if (fromIndex < 0) return picks;
  const clamped = Math.max(0, Math.min(3, toIndex));
  if (fromIndex === clamped) return picks;
  const next = [...current];
  next.splice(fromIndex, 1);
  next.splice(clamped, 0, teamId);
  return {
    ...picks,
    [group]: [next[0], next[1], next[2], next[3]] as GroupPicks[GroupId],
  };
}

function pruneKnockoutPicks(
  draft: BracketDraft,
): { picks: BracketDraft['knockoutPicks']; cleared: boolean } {
  const picks = { ...draft.knockoutPicks };
  let cleared = false;
  const order: MatchId[] = [
    ...getR32Order(),
    ...getR16Order(),
    ...getQFOrder(),
    ...getSFOrder(),
    'F',
  ];
  for (const id of order) {
    const winner = picks[id];
    if (!winner) continue;
    const probe: BracketDraft = { ...draft, knockoutPicks: picks };
    const resolved = resolveMatchup(id, probe);
    const isValid =
      winner === resolved.home || winner === resolved.away;
    if (!isValid) {
      delete picks[id];
      cleared = true;
    }
  }
  return { picks, cleared };
}

function applyPrune(draft: BracketDraft): {
  draft: BracketDraft;
  cleared: boolean;
} {
  const { picks, cleared } = pruneKnockoutPicks(draft);
  if (!cleared) return { draft, cleared: false };
  const finalChanged = !picks.F && Boolean(draft.knockoutPicks.F);
  return {
    draft: {
      ...draft,
      knockoutPicks: picks,
      finalScore: finalChanged
        ? { home: null, away: null }
        : draft.finalScore,
    },
    cleared: true,
  };
}

function toggleThirdPlace(
  draft: BracketDraft,
  group: GroupId,
): BracketDraft {
  const existing = draft.thirdPlaceAdvancers;
  if (existing.includes(group)) {
    return {
      ...draft,
      thirdPlaceAdvancers: existing.filter((g) => g !== group),
    };
  }
  if (existing.length >= REQUIRED_THIRD_PLACE) return draft;
  const next = [...existing, group].sort(
    (a, b) => GROUP_IDS.indexOf(a) - GROUP_IDS.indexOf(b),
  );
  return { ...draft, thirdPlaceAdvancers: next };
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_PAGE':
      return { ...state, activePage: action.page, viewingBracket: null };

    case 'SET_STEP':
      return { ...state, currentStep: action.step };

    case 'GROUP_REORDER': {
      const nextPicks = reorderGroup(
        state.draft.groupPicks,
        action.group,
        action.teamId,
        action.toIndex,
      );
      if (nextPicks === state.draft.groupPicks) return state;
      const pruned = applyPrune({ ...state.draft, groupPicks: nextPicks });
      return withActiveDraft(state, pruned.draft, {
        toast: pruned.cleared
          ? 'Some later picks were reset because the group changed.'
          : state.toast,
      });
    }

    case 'TOGGLE_THIRD_PLACE': {
      const nextDraft = toggleThirdPlace(state.draft, action.group);
      if (nextDraft === state.draft) return state;
      const pruned = applyPrune(nextDraft);
      return withActiveDraft(state, pruned.draft, {
        toast: pruned.cleared
          ? 'Some later picks were reset because the 3rd-place lineup changed.'
          : state.toast,
      });
    }

    case 'SET_KNOCKOUT_WINNER': {
      const picks = { ...state.draft.knockoutPicks };
      if (action.teamId === null) {
        delete picks[action.matchId];
      } else {
        picks[action.matchId] = action.teamId;
      }
      const finalChanged =
        action.matchId === 'F' &&
        state.draft.knockoutPicks.F !== action.teamId;
      const intermediate: BracketDraft = {
        ...state.draft,
        knockoutPicks: picks,
        finalScore: finalChanged
          ? { home: null, away: null }
          : state.draft.finalScore,
      };
      const pruned = applyPrune(intermediate);
      return withActiveDraft(state, pruned.draft, {
        toast: pruned.cleared
          ? 'Some later picks were reset because a winner changed.'
          : state.toast,
      });
    }

    case 'SET_FINAL_SCORE':
      return withActiveDraft(state, {
        ...state.draft,
        finalScore: { home: action.home, away: action.away },
      });

    case 'SET_BRACKET_NAME': {
      if (action.slot !== undefined && action.slot !== state.activeDraftSlot) {
        const drafts: [BracketDraft, BracketDraft] = [...state.drafts] as [
          BracketDraft,
          BracketDraft,
        ];
        drafts[action.slot] = {
          ...drafts[action.slot],
          bracketName: action.name,
        };
        return { ...state, drafts };
      }
      return withActiveDraft(state, {
        ...state.draft,
        bracketName: action.name,
      });
    }

    case 'SET_ACTIVE_DRAFT': {
      if (action.slot === state.activeDraftSlot) return state;
      const nextSlot = action.slot;
      return {
        ...state,
        activeDraftSlot: nextSlot,
        draft: state.drafts[nextSlot],
        currentStep: 'groups',
        submission: {
          status: state.submittedSlots[nextSlot] ? 'submitted' : 'idle',
        },
        overlay: null,
      };
    }

    case 'SET_IDENTITY':
      return {
        ...state,
        identity: action.identity,
        activePage:
          state.activePage === 'intro' ? 'bracket' : state.activePage,
      };

    case 'OPEN_BRACKET_VIEW':
      return {
        ...state,
        viewingBracket: action.view,
        activePage: 'bracket',
        overlay: null,
        currentStep: 'groups',
      };

    case 'CLOSE_BRACKET_VIEW':
      return { ...state, viewingBracket: null };

    case 'SET_OVERLAY':
      return { ...state, overlay: action.overlay };

    case 'MARK_SUBMITTED': {
      const submittedSlots: [boolean, boolean] = [...state.submittedSlots] as [
        boolean,
        boolean,
      ];
      submittedSlots[state.activeDraftSlot] = true;
      return {
        ...state,
        submission: { status: 'submitted' },
        submittedSlots,
        identity: state.identity
          ? {
              ...state.identity,
              submittedCount: state.identity.submittedCount + 1,
            }
          : state.identity,
      };
    }

    case 'SET_TOAST':
      return { ...state, toast: action.message };

    case 'SET_SUBMISSION_STATUS':
      return { ...state, submission: action.status };

    case 'RESET':
      return createInitialState();
  }
}
