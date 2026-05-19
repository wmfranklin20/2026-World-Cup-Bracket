import type { LeaderboardEntry } from '../../types/domain';
import { TeamRow } from '../displays/TeamRow';
import './LeaderboardTable.css';

interface Props {
  entries: LeaderboardEntry[];
  onView?: (entry: LeaderboardEntry) => void;
}

function formatAccuracy(entry: LeaderboardEntry): string {
  if (entry.decisionsCount === 0) return '—';
  return `${Math.round(entry.accuracy * 100)}%`;
}

function formatFinalScore(entry: LeaderboardEntry): string {
  const { finalScoreHome: h, finalScoreAway: a } = entry;
  if (h == null || a == null) return '—';
  return `${h}–${a}`;
}

export function LeaderboardTable({ entries, onView }: Props) {
  if (entries.length === 0) {
    return (
      <div className="leaderboard__empty">
        <p>No brackets submitted yet. Be the first!</p>
      </div>
    );
  }
  return (
    <div className="leaderboard">
      <table className="leaderboard__table">
        <thead>
          <tr>
            <th scope="col" className="leaderboard__rank-col">
              #
            </th>
            <th scope="col">Player</th>
            <th scope="col" className="leaderboard__round-col">
              Group
            </th>
            <th scope="col" className="leaderboard__round-col">
              R32
            </th>
            <th scope="col" className="leaderboard__round-col">
              R16
            </th>
            <th scope="col" className="leaderboard__round-col">
              QF
            </th>
            <th scope="col" className="leaderboard__round-col">
              SF
            </th>
            <th scope="col" className="leaderboard__round-col">
              F
            </th>
            <th scope="col" className="leaderboard__score-col">
              Score
            </th>
            <th scope="col" className="leaderboard__pick-col">
              Pick to win
            </th>
            <th scope="col" className="leaderboard__final-score-col">
              Final score
            </th>
            <th scope="col" className="leaderboard__potential-col">
              Possible+
            </th>
            <th scope="col" className="leaderboard__accuracy-col">
              Accuracy
            </th>
            <th
              scope="col"
              className="leaderboard__view-col"
              aria-label="View bracket"
            />
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={`${e.ownerUid}-${e.submittedAt}`}>
              <td className="leaderboard__rank-col">{e.rank}</td>
              <td className="leaderboard__name">
                <span className="leaderboard__player-name">
                  {e.displayName}
                </span>
                {e.bracketName && (
                  <span className="leaderboard__bracket-name">
                    {e.bracketName}
                  </span>
                )}
              </td>
              <td className="leaderboard__round-col">{e.groupPoints}</td>
              <td className="leaderboard__round-col">{e.r32Points}</td>
              <td className="leaderboard__round-col">{e.r16Points}</td>
              <td className="leaderboard__round-col">{e.qfPoints}</td>
              <td className="leaderboard__round-col">{e.sfPoints}</td>
              <td className="leaderboard__round-col">{e.fPoints}</td>
              <td className="leaderboard__score-col">{e.score}</td>
              <td className="leaderboard__pick-col">
                {e.finalPickTeamId ? (
                  <TeamRow
                    teamId={e.finalPickTeamId}
                    variant="compact"
                    showFlag
                  />
                ) : (
                  <span className="leaderboard__muted">—</span>
                )}
              </td>
              <td className="leaderboard__final-score-col">
                {formatFinalScore(e)}
              </td>
              <td className="leaderboard__potential-col">
                +{e.potentialRemaining}
              </td>
              <td className="leaderboard__accuracy-col">
                {formatAccuracy(e)}
              </td>
              <td className="leaderboard__view-col">
                {onView && (
                  <button
                    type="button"
                    className="leaderboard__view-btn"
                    onClick={() => onView(e)}
                    aria-label={`View ${e.bracketName || 'bracket'} by ${e.displayName}`}
                    title="View this bracket"
                  >
                    <svg className="icon" aria-hidden="true">
                      <use href="/icons.svg#eye" />
                    </svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
