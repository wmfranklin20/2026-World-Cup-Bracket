import { useAppState } from '../../hooks/useAppState';
import { resolveFinal } from '../../lib/bracketSeeding';
import { teamName } from '../../lib/teamLookup';
import type { BracketDraft } from '../../types/domain';
import { Stepper } from '../buttons/Stepper';
import { TeamRow } from '../displays/TeamRow';
import './FinalScorePanel.css';

interface Props {
  draft: BracketDraft;
  readOnly?: boolean;
}

export function FinalScorePanel({ draft, readOnly = false }: Props) {
  const { dispatch } = useAppState();
  const final = resolveFinal(draft);
  const { home: homeScore, away: awayScore } = draft.finalScore;
  const finalWinner = draft.knockoutPicks.F ?? null;

  if (!final.home || !final.away || !finalWinner) return null;

  const homeIsWinner = finalWinner === final.home;
  const winnerScore = homeIsWinner ? (homeScore ?? 0) : (awayScore ?? 0);

  const setHome = (v: number) => {
    let nextAway = awayScore ?? 0;
    if (homeIsWinner && nextAway > v) nextAway = v;
    dispatch({ type: 'SET_FINAL_SCORE', home: v, away: nextAway });
  };
  const setAway = (v: number) => {
    let nextHome = homeScore ?? 0;
    if (!homeIsWinner && nextHome > v) nextHome = v;
    dispatch({ type: 'SET_FINAL_SCORE', home: nextHome, away: v });
  };

  return (
    <div className="final-panel">
      <h2>Final Score Prediction</h2>
      {!readOnly && (
        <p className="final-panel__sub">
          Set the winner's score first — the runner-up can't outscore them.
          Tied scores go to penalties.
        </p>
      )}
      <div className="final-panel__board">
        <TeamRow
          teamId={final.home}
          variant={homeIsWinner ? 'picked' : 'default'}
        />
        <div className="final-panel__sep" aria-hidden="true">
          v
        </div>
        <TeamRow
          teamId={final.away}
          variant={!homeIsWinner ? 'picked' : 'default'}
        />
        {readOnly ? (
          <>
            <div
              className="final-panel__readout"
              aria-label={`${teamName(final.home)} score`}
            >
              {homeScore ?? '—'}
            </div>
            <div
              className="final-panel__readout"
              aria-label={`${teamName(final.away)} score`}
            >
              {awayScore ?? '—'}
            </div>
          </>
        ) : (
          <>
            <Stepper
              label={teamName(final.home)}
              value={homeScore}
              max={homeIsWinner ? 20 : winnerScore}
              onChange={setHome}
            />
            <Stepper
              label={teamName(final.away)}
              value={awayScore}
              max={!homeIsWinner ? 20 : winnerScore}
              onChange={setAway}
            />
          </>
        )}
      </div>
    </div>
  );
}
