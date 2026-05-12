import type {
  ActivePage,
  AppState,
  BracketDraft,
  GroupId,
  GroupPicks,
  MatchId,
  TeamId,
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
  | { type: 'SET_DISPLAY_NAME'; name: string }
  | { type: 'SET_TOAST'; message: string | null }
  | { type: 'SET_SUBMISSION_STATUS'; status: AppState['submission'] }
  | { type: 'RESET' };

export function createInitialState(draftOverride?: BracketDraft): AppState {
  return {
    activePage: 'bracket',
    currentStep: 'groups',
    draft: draftOverride ?? createInitialDraft(),
    submission: { status: 'idle' },
    toast: null,
  };
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
      return { ...state, activePage: action.page };

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
      return {
        ...state,
        draft: pruned.draft,
        toast: pruned.cleared
          ? 'Some later picks were reset because the group changed.'
          : state.toast,
      };
    }

    case 'TOGGLE_THIRD_PLACE': {
      const nextDraft = toggleThirdPlace(state.draft, action.group);
      if (nextDraft === state.draft) return state;
      const pruned = applyPrune(nextDraft);
      return {
        ...state,
        draft: pruned.draft,
        toast: pruned.cleared
          ? 'Some later picks were reset because the 3rd-place lineup changed.'
          : state.toast,
      };
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
      return {
        ...state,
        draft: pruned.draft,
        toast: pruned.cleared
          ? 'Some later picks were reset because a winner changed.'
          : state.toast,
      };
    }

    case 'SET_FINAL_SCORE':
      return {
        ...state,
        draft: {
          ...state.draft,
          finalScore: { home: action.home, away: action.away },
        },
      };

    case 'SET_DISPLAY_NAME':
      return {
        ...state,
        draft: { ...state.draft, displayName: action.name },
      };

    case 'SET_TOAST':
      return { ...state, toast: action.message };

    case 'SET_SUBMISSION_STATUS':
      return { ...state, submission: action.status };

    case 'RESET':
      return createInitialState();
  }
}
