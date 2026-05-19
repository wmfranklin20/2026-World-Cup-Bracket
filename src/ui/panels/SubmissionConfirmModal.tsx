import { useEffect, useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import { submitBracket } from '../../lib/brackets';
import { resolveFinal } from '../../lib/bracketSeeding';
import { teamFlag, teamName } from '../../lib/teamLookup';
import {
  canSubmit,
  isBracketNameValid,
  isIdentityEmailValid,
  isIdentityNameValid,
} from '../../lib/validation';
import type { AppState } from '../../types/domain';
import { Button } from '../buttons/Button';
import { TextInput } from '../buttons/TextInput';
import './SubmissionConfirmModal.css';

export function SubmissionConfirmModal() {
  const { state, dispatch, authUid } = useAppState();
  const { draft, identity, submission } = state;
  const final = resolveFinal(draft);
  const submitting = submission.status === 'submitting';

  const [bracketName, setBracketName] = useState(draft.bracketName);
  const [name, setName] = useState(identity?.displayName ?? '');
  const [email, setEmail] = useState(identity?.email ?? '');
  const [showErrors, setShowErrors] = useState(false);

  const bracketNameValid = isBracketNameValid(bracketName);
  const nameValid = isIdentityNameValid(name);
  const emailValid = isIdentityEmailValid(email);
  const formValid = bracketNameValid && nameValid && emailValid;

  const candidateState: AppState = {
    ...state,
    identity: identity
      ? {
          ...identity,
          displayName: name.trim(),
          email: email.trim(),
        }
      : null,
    draft: { ...draft, bracketName: bracketName.trim() },
  };
  const ready = canSubmit(candidateState);

  const winnerId = final.winner;
  const runnerUpId =
    winnerId && (winnerId === final.home ? final.away : final.home);
  const winnerScore =
    winnerId === final.home
      ? draft.finalScore.home
      : draft.finalScore.away;
  const runnerUpScore =
    winnerId === final.home
      ? draft.finalScore.away
      : draft.finalScore.home;
  const winnerFlag = winnerId ? teamFlag(winnerId) : '';

  const close = () => {
    if (submitting) return;
    dispatch({ type: 'SET_OVERLAY', overlay: null });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitting]);

  const handleConfirm = async () => {
    if (submitting) return;
    if (!formValid) {
      setShowErrors(true);
      return;
    }
    if (!authUid) {
      dispatch({
        type: 'SET_TOAST',
        message: "Still signing in — try again in a moment.",
      });
      return;
    }
    const updatedIdentity = {
      displayName: name.trim(),
      email: email.trim(),
      submittedCount: identity?.submittedCount ?? 0,
    };
    const trimmedBracketName = bracketName.trim();
    const updatedState: AppState = {
      ...state,
      identity: updatedIdentity,
      draft: { ...state.draft, bracketName: trimmedBracketName },
    };
    if (!canSubmit(updatedState)) return;
    dispatch({ type: 'SET_IDENTITY', identity: updatedIdentity });
    dispatch({ type: 'SET_BRACKET_NAME', name: trimmedBracketName });
    dispatch({
      type: 'SET_SUBMISSION_STATUS',
      status: { status: 'submitting' },
    });
    try {
      await submitBracket(updatedState, authUid);
      dispatch({ type: 'MARK_SUBMITTED' });
      dispatch({ type: 'SET_OVERLAY', overlay: 'post-submit' });
      dispatch({ type: 'SET_TOAST', message: 'Bracket submitted!' });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Submission failed.';
      dispatch({
        type: 'SET_SUBMISSION_STATUS',
        status: { status: 'error', error: msg },
      });
      dispatch({
        type: 'SET_TOAST',
        message: "Couldn't submit — try again.",
      });
    }
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
        aria-labelledby="submit-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="submit-modal__head">
          <h2 id="submit-modal-title">Confirm your submission</h2>
          <p>Review the details below. Submissions are final once sent.</p>
        </header>

        <div className="submit-modal__hero">
          <span className="submit-modal__hero-label">Your champion</span>
          <div className="submit-modal__hero-team">
            {winnerFlag && (
              <img
                className="submit-modal__hero-flag"
                src={winnerFlag}
                alt=""
                aria-hidden="true"
              />
            )}
            <span className="submit-modal__hero-name">
              {winnerId ? teamName(winnerId) : '—'}
            </span>
          </div>
          {winnerId && runnerUpId && (
            <div className="submit-modal__hero-score">
              <span className="submit-modal__hero-score-team">
                {teamName(winnerId)}
              </span>
              <span className="submit-modal__hero-score-value">
                {winnerScore}
              </span>
              <span className="submit-modal__hero-score-sep">–</span>
              <span className="submit-modal__hero-score-value">
                {runnerUpScore}
              </span>
              <span className="submit-modal__hero-score-team">
                {teamName(runnerUpId)}
              </span>
            </div>
          )}
        </div>

        <form
          className="submit-modal__form"
          onSubmit={(e) => {
            e.preventDefault();
            void handleConfirm();
          }}
          noValidate
        >
          <TextInput
            label="Bracket name"
            value={bracketName}
            onChange={setBracketName}
            placeholder="e.g. Will's Worst Picks"
            maxLength={40}
            disabled={submitting}
            required
          />
          {showErrors && !bracketNameValid && (
            <p className="submit-modal__error">
              Bracket name must be at least 2 characters.
            </p>
          )}
          <TextInput
            label="Name"
            value={name}
            onChange={setName}
            placeholder="How you'll appear on the leaderboard"
            autoComplete="name"
            maxLength={32}
            disabled={submitting}
            required
          />
          {showErrors && !nameValid && (
            <p className="submit-modal__error">
              Name must be at least 2 characters.
            </p>
          )}
          <TextInput
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            disabled={submitting}
            required
          />
          {showErrors && !emailValid && (
            <p className="submit-modal__error">
              Enter a valid email address.
            </p>
          )}
        </form>

        <footer className="submit-modal__actions">
          <Button variant="ghost" onClick={close} disabled={submitting}>
            Go back
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!ready || !formValid || submitting || !authUid}
          >
            {submitting ? 'Submitting…' : 'Submit bracket'}
          </Button>
        </footer>
      </div>
    </div>
  );
}
