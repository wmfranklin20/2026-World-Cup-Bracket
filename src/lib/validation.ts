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
  if (!Number.isInteger(home) || !Number.isInteger(away)) return false;
  if (!draft.knockoutPicks.F) return false;
  return true;
}

export function isIdentityNameValid(name: string): boolean {
  return name.trim().length >= 2;
}

export function isBracketNameValid(name: string): boolean {
  return name.trim().length >= 2;
}

export function isIdentityEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function canAdvance(state: AppState, step: WizardStep): boolean {
  const { draft } = state;
  switch (step) {
    case 'groups':
      return isThirdPlaceStepValid(draft);
    case 'knockout':
      return isKnockoutStepValid(draft) && isFinalStepValid(draft);
  }
}

export function canSubmit(state: AppState): boolean {
  const { draft, identity } = state;
  return (
    !!identity &&
    isThirdPlaceStepValid(draft) &&
    isKnockoutStepValid(draft) &&
    isFinalStepValid(draft)
  );
}
