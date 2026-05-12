import { useAppState } from '../../hooks/useAppState';
import { resolveFinal } from '../../lib/bracketSeeding';
import { teamName } from '../../lib/teamLookup';
import { Stepper } from '../buttons/Stepper';
import { TeamRow } from '../displays/TeamRow';
import './FinalScorePanel.css';

export function FinalScorePanel() {
  const { state, dispatch } = useAppState();
  const final = resolveFinal(state.draft);
  const { home, away } = state.draft.finalScore;

  if (!final.home || !final.away) {
    return (
      <div className="final-panel final-panel--empty">
        <h2>Final score</h2>
        <p>
          Pick winners through to the Final before predicting the score. The
          two finalists will appear here.
        </p>
      </div>
    );
  }

  const homeName = teamName(final.home);
  const awayName = teamName(final.away);

  return (
    <div className="final-panel">
      <h2>Predict the final score</h2>
      <p className="final-panel__sub">
        Used as a tiebreaker when scoring leaderboard rankings.
      </p>
      <div className="final-panel__board">
        <TeamRow teamId={final.home} variant="picked" />
        <div className="final-panel__sep" aria-hidden="true">
          v
        </div>
        <TeamRow teamId={final.away} variant="picked" />
        <Stepper
          label={homeName}
          value={home}
          onChange={(v) =>
            dispatch({ type: 'SET_FINAL_SCORE', home: v, away: away ?? 0 })
          }
        />
        <Stepper
          label={awayName}
          value={away}
          onChange={(v) =>
            dispatch({ type: 'SET_FINAL_SCORE', home: home ?? 0, away: v })
          }
        />
      </div>
      {home !== null && away !== null && home === away && (
        <p className="final-panel__warning">
          Knockout finals can't end in a draw — pick different scores.
        </p>
      )}
    </div>
  );
}
