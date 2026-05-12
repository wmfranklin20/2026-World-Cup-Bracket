import {
  WIZARD_STEPS,
  WIZARD_STEP_LABEL,
  type WizardStep,
} from '../../types/domain';
import './WizardProgress.css';

interface Props {
  currentStep: WizardStep;
  furthestStep: WizardStep;
  onJump: (step: WizardStep) => void;
}

export function WizardProgress({ currentStep, furthestStep, onJump }: Props) {
  const currentIdx = WIZARD_STEPS.indexOf(currentStep);
  const furthestIdx = WIZARD_STEPS.indexOf(furthestStep);
  return (
    <ol className="wizard-progress" aria-label="Bracket steps">
      {WIZARD_STEPS.map((step, idx) => {
        const reachable = idx <= furthestIdx;
        const isCurrent = idx === currentIdx;
        const isComplete = idx < currentIdx;
        return (
          <li
            key={step}
            className={[
              'wizard-progress__item',
              isCurrent && 'wizard-progress__item--current',
              isComplete && 'wizard-progress__item--complete',
              !reachable && 'wizard-progress__item--locked',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <button
              type="button"
              className="wizard-progress__dot"
              onClick={() => reachable && onJump(step)}
              disabled={!reachable}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="wizard-progress__num">{idx + 1}</span>
            </button>
            <span className="wizard-progress__label">
              {WIZARD_STEP_LABEL[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
