import { useEffect } from 'react';
import { useAppState } from '../../hooks/useAppState';
import type { DraftSlot } from '../../types/domain';
import { Button } from '../buttons/Button';
import './SubmissionConfirmModal.css';

export function PostSubmitModal() {
  const { state, dispatch } = useAppState();
  const otherSlot: DraftSlot = state.activeDraftSlot === 0 ? 1 : 0;
  const otherSubmitted = state.submittedSlots[otherSlot];
  const otherName =
    state.drafts[otherSlot].bracketName.trim() || `Bracket ${otherSlot + 1}`;

  const close = () => dispatch({ type: 'SET_OVERLAY', overlay: null });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinueOther = () => {
    dispatch({ type: 'SET_ACTIVE_DRAFT', slot: otherSlot });
    dispatch({ type: 'SET_OVERLAY', overlay: null });
  };

  const handleLeaderboard = () => {
    dispatch({ type: 'SET_OVERLAY', overlay: null });
    dispatch({ type: 'SET_ACTIVE_PAGE', page: 'leaderboard' });
  };

  return (
    <div
      className="submit-modal__backdrop"
      onClick={close}
      role="presentation"
    >
      <div
        className="submit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-submit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="submit-modal__head">
          <h2 id="post-submit-title">Bracket submitted!</h2>
          <p>
            {otherSubmitted
              ? 'Both of your brackets are in. Good luck on the leaderboard.'
              : `Your other bracket, "${otherName}", is still waiting.`}
          </p>
        </header>
        <footer className="submit-modal__actions">
          <Button variant="ghost" onClick={handleLeaderboard}>
            View leaderboard
          </Button>
          {!otherSubmitted && (
            <Button variant="primary" onClick={handleContinueOther}>
              Continue to "{otherName}"
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}
