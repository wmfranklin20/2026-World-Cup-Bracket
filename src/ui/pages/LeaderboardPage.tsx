import type { LeaderboardEntry } from '../../types/domain';
import { LeaderboardTable } from '../panels/LeaderboardTable';
import './LeaderboardPage.css';

// TODO(backend-plan): fetch live entries from Firestore here.
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, displayName: 'Sam', score: 142, submittedAt: '2026-06-01' },
  { rank: 2, displayName: 'Priya', score: 138, submittedAt: '2026-06-01' },
  { rank: 3, displayName: 'Diego', score: 131, submittedAt: '2026-06-02' },
  { rank: 4, displayName: 'Mei', score: 124, submittedAt: '2026-06-02' },
  { rank: 5, displayName: 'Alex', score: 119, submittedAt: '2026-06-03' },
];

export function LeaderboardPage() {
  return (
    <div className="leaderboard-page">
      <header className="leaderboard-page__head">
        <div>
          <h2>Leaderboard</h2>
          <p>
            Ranked by total score across group standings, knockout picks, and
            the final score tiebreaker.
          </p>
        </div>
        <span className="leaderboard-page__stub" aria-hidden="true">
          Preview data — live results land once the tournament starts.
        </span>
      </header>
      <LeaderboardTable entries={MOCK_LEADERBOARD} />
    </div>
  );
}
