import { useAppState } from '../../hooks/useAppState';
import { REQUIRED_THIRD_PLACE } from '../../lib/validation';
import type { DraftSlot } from '../../types/domain';
import { Button } from '../buttons/Button';
import { GroupGrid } from '../panels/GroupGrid';
import { KnockoutBracket } from '../panels/KnockoutBracket';
import './BracketPage.css';

const SLOTS: DraftSlot[] = [0, 1];

export function BracketPage() {
  const { state, dispatch } = useAppState();
  const { currentStep, identity, submittedSlots, activeDraftSlot, viewingBracket } =
    state;
  const ownSubmitted = submittedSlots[activeDraftSlot];
  const isViewing = viewingBracket !== null;
  const draft = viewingBracket ? viewingBracket.draft : state.draft;
  const locked = isViewing || ownSubmitted;
  const thirdPlaceCount = draft.thirdPlaceAdvancers.length;

  const exitView = () => {
    dispatch({ type: 'CLOSE_BRACKET_VIEW' });
    dispatch({ type: 'SET_ACTIVE_PAGE', page: 'leaderboard' });
  };

  return (
    <div className="bracket-page">
      {isViewing && viewingBracket && (
        <div className="bracket-page__header bracket-page__header--viewing">
          <div className="bracket-page__viewing">
            <div className="bracket-page__viewing-text">
              <span className="bracket-page__viewing-label">Viewing</span>
              <strong>{viewingBracket.bracketName}</strong>
              <span className="bracket-page__viewing-owner">
                by {viewingBracket.ownerDisplayName}
              </span>
            </div>
            <Button variant="ghost" onClick={exitView}>
              <svg className="icon" aria-hidden="true">
                <use href="/icons.svg#x-mark" />
              </svg>
              Exit view
            </Button>
          </div>
        </div>
      )}
      {!isViewing && identity && (
        <div className="bracket-page__header" aria-live="polite">
          <div className="bracket-page__identity">
            <strong>{identity.displayName}</strong>
            <span className="bracket-page__identity-status">
              {ownSubmitted ? 'Submitted' : 'Drafting'}
            </span>
          </div>
          <div className="bracket-page__brackets" role="tablist" aria-label="Switch bracket">
            {SLOTS.map((slot) => {
              const isActive = slot === activeDraftSlot;
              const slotSubmitted = submittedSlots[slot];
              const slotDraft = state.drafts[slot];
              const label =
                slotDraft.bracketName.trim() || `Bracket ${slot + 1}`;
              const className = [
                'bracket-page__bracket-tab',
                isActive && 'bracket-page__bracket-tab--active',
                slotSubmitted && 'bracket-page__bracket-tab--submitted',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <button
                  key={slot}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={className}
                  onClick={() =>
                    dispatch({ type: 'SET_ACTIVE_DRAFT', slot })
                  }
                >
                  <span className="bracket-page__bracket-tab-num">
                    {slot + 1}
                  </span>
                  <span className="bracket-page__bracket-tab-name">
                    {label}
                  </span>
                  {slotSubmitted && (
                    <span className="bracket-page__bracket-tab-badge">
                      Submitted
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {currentStep === 'groups' && (
        <section className="bracket-page__step" aria-labelledby="step-groups">
          <header className="bracket-page__step-head">
            <h2 id="step-groups">Predict each group's order</h2>
            {!locked && (
              <p>
                Drag teams to set your predicted 1st–4th finish. The top 2 of
                each group advance automatically — pick which 8 of the 12
                third-place teams also advance.
              </p>
            )}
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
            <GroupGrid draft={draft} locked={locked} />
          </div>
        </section>
      )}
      {currentStep === 'knockout' && (
        <section className="bracket-page__step" aria-labelledby="step-knockout">
          <header className="bracket-page__step-head">
            <h2 id="step-knockout">Knockout bracket</h2>
            {!locked && (
              <p>
                Click a team in each match to advance them, then predict the
                final score below.
              </p>
            )}
          </header>
          <div className="bracket-page__scroll">
            <KnockoutBracket draft={draft} readOnly={locked} />
          </div>
        </section>
      )}
    </div>
  );
}
