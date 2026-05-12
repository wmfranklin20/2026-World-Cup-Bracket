import { useAppState } from '../../hooks/useAppState';
import { REQUIRED_THIRD_PLACE } from '../../lib/validation';
import { GroupGrid } from '../panels/GroupGrid';
import { KnockoutBracket } from '../panels/KnockoutBracket';
import { ReviewSummary } from '../panels/ReviewSummary';
import './BracketPage.css';

export function BracketPage() {
  const { state } = useAppState();
  const { currentStep } = state;
  const thirdPlaceCount = state.draft.thirdPlaceAdvancers.length;

  return (
    <div className="bracket-page">
      {currentStep === 'groups' && (
        <section className="bracket-page__step" aria-labelledby="step-groups">
          <header className="bracket-page__step-head">
            <h2 id="step-groups">Predict each group's order</h2>
            <p>
              Drag teams to set your predicted 1st–4th finish. The top 2 of
              each group advance automatically — pick which 8 of the 12
              third-place teams also advance.
            </p>
            <span
              className={[
                'bracket-page__counter',
                thirdPlaceCount === REQUIRED_THIRD_PLACE &&
                  'bracket-page__counter--complete',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-live="polite"
            >
              {thirdPlaceCount} of {REQUIRED_THIRD_PLACE} third-place teams
              advancing
            </span>
          </header>
          <div className="bracket-page__scroll">
            <GroupGrid />
          </div>
        </section>
      )}
      {currentStep === 'knockout' && (
        <section className="bracket-page__step" aria-labelledby="step-knockout">
          <header className="bracket-page__step-head">
            <h2 id="step-knockout">Knockout bracket</h2>
            <p>
              Click a team in each match to advance them, then predict the
              final score below.
            </p>
          </header>
          <div className="bracket-page__scroll">
            <KnockoutBracket />
          </div>
        </section>
      )}
      {currentStep === 'review' && (
        <div className="bracket-page__scroll">
          <ReviewSummary />
        </div>
      )}
    </div>
  );
}
