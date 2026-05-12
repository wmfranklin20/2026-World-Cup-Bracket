import type { LeaderboardEntry } from '../../types/domain';
import './LeaderboardTable.css';

interface Props {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: Props) {
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
            <th scope="col">Name</th>
            <th scope="col" className="leaderboard__score-col">
              Score
            </th>
            <th scope="col" className="leaderboard__date-col">
              Submitted
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={`${e.rank}-${e.displayName}`}>
              <td className="leaderboard__rank-col">{e.rank}</td>
              <td className="leaderboard__name">{e.displayName}</td>
              <td className="leaderboard__score-col">{e.score}</td>
              <td className="leaderboard__date-col">{e.submittedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
