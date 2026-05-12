import type { AppState, BracketDraft, WizardStep } from '../types/domain';
import {
  getQFOrder,
  getR16Order,
  getR32Order,
  getSFOrder,
} from './bracketSeeding';

export const REQUIRED_THIRD_PLACE = 8;

export function isThirdPlaceStepValid(draft: BracketDraft): boolean {
  return draft.thirdPlaceAdvancers.length === REQUIRED_THIRD_PLACE;
}

export function isKnockoutStepValid(draft: BracketDraft): boolean {
  const ids = [
    ...getR32Order(),
    ...getR16Order(),
    ...getQFOrder(),
    ...getSFOrder(),
  ];
  return ids.every((id) => Boolean(draft.knockoutPicks[id]));
}

export function isFinalStepValid(draft: BracketDraft): boolean {
  const { home, away } = draft.finalScore;
  if (home === null || away === null) return false;
  if (home < 0 || away < 0) return false;
  if (home === away) return false;
  if (!Number.isInteger(home) || !Number.isInteger(away)) return false;
  if (!draft.knockoutPicks.F) return false;
  return true;
}

export function isReviewStepValid(draft: BracketDraft): boolean {
  return draft.displayName.trim().length >= 2;
}

export function canAdvance(state: AppState, step: WizardStep): boolean {
  const { draft } = state;
  switch (step) {
    case 'groups':
      return isThirdPlaceStepValid(draft);
    case 'knockout':
      return isKnockoutStepValid(draft) && isFinalStepValid(draft);
    case 'review':
      return isReviewStepValid(draft);
  }
}

export function canSubmit(state: AppState): boolean {
  const { draft } = state;
  return (
    isThirdPlaceStepValid(draft) &&
    isKnockoutStepValid(draft) &&
    isFinalStepValid(draft) &&
    isReviewStepValid(draft)
  );
}
