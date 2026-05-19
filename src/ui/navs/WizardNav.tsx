import { useAppState } from '../../hooks/useAppState';
import { canAdvance, canSubmit } from '../../lib/validation';
import {
  WIZARD_STEPS,
  WIZARD_STEP_LABEL,
  type DraftSlot,
  type WizardStep,
} from '../../types/domain';
import { Button } from '../buttons/Button';
import { WizardProgress } from './WizardProgress';
import './WizardNav.css';

export function WizardNav() {
  const { state, dispatch } = useAppState();
  const { currentStep, submittedSlots, activeDraftSlot, viewingBracket } =
    state;
  const stepIdx = WIZARD_STEPS.indexOf(currentStep);
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === WIZARD_STEPS.length - 1;
  const submitted = submittedSlots[activeDraftSlot];
  const otherSlot: DraftSlot = activeDraftSlot === 0 ? 1 : 0;
  const otherSubmitted = submittedSlots[otherSlot];
  const otherName =
    state.drafts[otherSlot].bracketName.trim() || `Bracket ${otherSlot + 1}`;

  const handlePrev = () => {
    if (isFirst) return;
    const prev = WIZARD_STEPS[stepIdx - 1] as WizardStep;
    dispatch({ type: 'SET_STEP', step: prev });
  };

  const handleNext = () => {
    if (isLast) return;
    if (!viewingBracket && !canAdvance(state, currentStep)) return;
    const next = WIZARD_STEPS[stepIdx + 1] as WizardStep;
    dispatch({ type: 'SET_STEP', step: next });
  };

  const openSubmit = () =>
    dispatch({ type: 'SET_OVERLAY', overlay: 'submit-confirm' });

  const continueToOther = () =>
    dispatch({ type: 'SET_ACTIVE_DRAFT', slot: otherSlot });

  let actionButton: React.ReactNode = null;
  if (viewingBracket && !isLast) {
    const nextStep = WIZARD_STEPS[stepIdx + 1] as WizardStep;
    actionButton = (
      <Button variant="primary" onClick={handleNext}>
        Next: {WIZARD_STEP_LABEL[nextStep]}
        <svg className="icon" aria-hidden="true">
          <use href="/icons.svg#chevron-right" />
        </svg>
      </Button>
    );
  } else if (viewingBracket) {
    actionButton = null;
  } else if (!isLast) {
    const nextStep = WIZARD_STEPS[stepIdx + 1] as WizardStep;
    actionButton = (
      <Button
        variant="primary"
        onClick={handleNext}
        disabled={!canAdvance(state, currentStep)}
      >
        Next: {WIZARD_STEP_LABEL[nextStep]}
        <svg className="icon" aria-hidden="true">
          <use href="/icons.svg#chevron-right" />
        </svg>
      </Button>
    );
  } else if (submitted && !otherSubmitted) {
    actionButton = (
      <Button variant="primary" onClick={continueToOther}>
        Continue to "{otherName}"
      </Button>
    );
  } else if (submitted) {
    actionButton = (
      <Button variant="ghost" disabled>
        Submitted
      </Button>
    );
  } else {
    actionButton = (
      <Button
        variant="primary"
        onClick={openSubmit}
        disabled={!canSubmit(state)}
      >
        Submit bracket
      </Button>
    );
  }

  return (
    <div className="wizard-nav">
      <Button
        variant="ghost"
        onClick={handlePrev}
        disabled={isFirst}
        aria-label="Previous step"
      >
        <svg className="icon" aria-hidden="true">
          <use href="/icons.svg#chevron-left" />
        </svg>
        Back
      </Button>
      <WizardProgress
        currentStep={currentStep}
        furthestStep="knockout"
        onJump={(step) => dispatch({ type: 'SET_STEP', step })}
      />
      {actionButton}
    </div>
  );
}
