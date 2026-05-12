import { useAppState } from '../../hooks/useAppState';
import { resolveMatchup } from '../../lib/bracketSeeding';
import type { MatchId, TeamId } from '../../types/domain';
import { teamName } from '../../lib/teamLookup';
import { TeamRow } from '../displays/TeamRow';
import { EmptyTeamSlot } from '../displays/EmptyTeamSlot';
import './MatchSlot.css';

interface Props {
  matchId: MatchId;
  readOnly?: boolean;
}

export function MatchSlot({ matchId, readOnly = false }: Props) {
  const { state, dispatch } = useAppState();
  const matchup = resolveMatchup(matchId, state.draft);

  const onPick = (teamId: TeamId | null) => {
    if (readOnly || !teamId) return;
    const next = matchup.winner === teamId ? null : teamId;
    dispatch({ type: 'SET_KNOCKOUT_WINNER', matchId, teamId: next });
  };

  const renderSide = (teamId: TeamId | null, label: string) => {
    if (!teamId) return <EmptyTeamSlot label={label} />;
    const isWinner = matchup.winner === teamId;
    const isLoser = matchup.winner !== null && !isWinner;
    const variant = isWinner ? 'picked' : isLoser ? 'eliminated' : 'default';
    return (
      <button
        type="button"
        className={[
          'match-slot__side',
          isWinner && 'match-slot__side--winner',
          readOnly && 'match-slot__side--readonly',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => onPick(teamId)}
        disabled={readOnly}
        aria-label={`Pick ${teamName(teamId)} to advance`}
        aria-pressed={isWinner}
      >
        <TeamRow teamId={teamId} variant={variant} showCode />
      </button>
    );
  };

  return (
    <article
      className="match-slot"
      aria-label={`${matchId}: ${matchup.homeLabel} vs ${matchup.awayLabel}`}
    >
      <span className="match-slot__id">{matchId}</span>
      <div className="match-slot__sides">
        {renderSide(matchup.home, matchup.homeLabel)}
        {renderSide(matchup.away, matchup.awayLabel)}
      </div>
    </article>
  );
}
