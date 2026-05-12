import { useAppState } from '../../hooks/useAppState';
import { canAdvance, canSubmit } from '../../lib/validation';
import {
  WIZARD_STEPS,
  WIZARD_STEP_LABEL,
  type WizardStep,
} from '../../types/domain';
import { Button } from '../buttons/Button';
import { WizardProgress } from './WizardProgress';
import './WizardNav.css';

export function WizardNav() {
  const { state, dispatch } = useAppState();
  const { currentStep, submission } = state;
  const stepIdx = WIZARD_STEPS.indexOf(currentStep);
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === WIZARD_STEPS.length - 1;
  const submitted = submission.status === 'submitted';
  const submitting = submission.status === 'submitting';

  const handlePrev = () => {
    if (isFirst) return;
    const prev = WIZARD_STEPS[stepIdx - 1] as WizardStep;
    dispatch({ type: 'SET_STEP', step: prev });
  };

  const handleNext = () => {
    if (!canAdvance(state, currentStep)) return;
    const next = WIZARD_STEPS[stepIdx + 1] as WizardStep;
    dispatch({ type: 'SET_STEP', step: next });
  };

  const handleSubmit = () => {
    if (!canSubmit(state) || submitted || submitting) return;
    dispatch({
      type: 'SET_SUBMISSION_STATUS',
      status: { status: 'submitted' },
    });
  };

  const nextLabel = isLast
    ? submitted
      ? 'Submitted'
      : 'Submit bracket'
    : `Next: ${WIZARD_STEP_LABEL[WIZARD_STEPS[stepIdx + 1] as WizardStep]}`;

  const nextDisabled = isLast
    ? !canSubmit(state) || submitted || submitting
    : !canAdvance(state, currentStep);

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
        furthestStep="review"
        onJump={(step) => dispatch({ type: 'SET_STEP', step })}
      />
      <Button
        variant="primary"
        onClick={isLast ? handleSubmit : handleNext}
        disabled={nextDisabled}
      >
        {nextLabel}
        {!isLast && (
          <svg className="icon" aria-hidden="true">
            <use href="/icons.svg#chevron-right" />
          </svg>
        )}
      </Button>
    </div>
  );
}
