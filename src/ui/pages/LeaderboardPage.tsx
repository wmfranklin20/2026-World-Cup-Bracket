import { useEffect, useMemo, useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import {
  getAllSubmittedBrackets,
  type SubmissionDoc,
} from '../../lib/brackets';
import { fetchResults } from '../../lib/results';
import { scoreBracket } from '../../lib/scoring';
import type { LeaderboardEntry, ResultsBracket } from '../../types/domain';
import { LeaderboardTable } from '../panels/LeaderboardTable';
import './LeaderboardPage.css';

type Status = 'loading' | 'ready' | 'error';

function buildEntries(
  submissions: SubmissionDoc[],
  results: ResultsBracket,
): LeaderboardEntry[] {
  const scored = submissions.map((sub) => {
    const s = scoreBracket(sub.draft, results);
    return {
      docId: sub.id,
      ownerUid: sub.ownerUid,
      displayName: sub.displayName,
      finalPickTeamId: sub.draft.knockoutPicks.F ?? null,
      score: s.score,
      potentialRemaining: s.potentialRemaining,
      accuracy: s.accuracy,
      decisionsCount: s.decisionsCount,
      finalScoreBonus: s.finalScoreBonus,
      submittedAt: sub.submittedAt,
      groupPoints: s.breakdown.group,
      r32Points: s.breakdown.R32,
      r16Points: s.breakdown.R16,
      qfPoints: s.breakdown.QF,
      sfPoints: s.breakdown.SF,
      fPoints: s.breakdown.F,
      finalScoreHome: sub.draft.finalScore?.home ?? null,
      finalScoreAway: sub.draft.finalScore?.away ?? null,
      bracketName: sub.draft.bracketName ?? '',
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.finalScoreBonus !== a.finalScoreBonus)
      return b.finalScoreBonus - a.finalScoreBonus;
    return a.submittedAt - b.submittedAt;
  });

  let lastScore = Number.NaN;
  let lastBonus = Number.NaN;
  let lastRank = 0;
  return scored.map((entry, idx) => {
    const sameAsPrev =
      entry.score === lastScore && entry.finalScoreBonus === lastBonus;
    const rank = sameAsPrev ? lastRank : idx + 1;
    lastScore = entry.score;
    lastBonus = entry.finalScoreBonus;
    lastRank = rank;
    return { ...entry, rank };
  });
}

export function LeaderboardPage() {
  const { dispatch } = useAppState();
  const [submissions, setSubmissions] = useState<SubmissionDoc[]>([]);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [tournamentStarted, setTournamentStarted] = useState(false);

  const submissionsById = useMemo(() => {
    const map = new Map<string, SubmissionDoc>();
    for (const s of submissions) map.set(s.id, s);
    return map;
  }, [submissions]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAllSubmittedBrackets(), fetchResults()])
      .then(([subs, results]) => {
        if (cancelled) return;
        setSubmissions(subs);
        setEntries(buildEntries(subs, results));
        setTournamentStarted(results.updatedAt > 0);
        setStatus('ready');
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load leaderboard.');
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleView = (entry: LeaderboardEntry) => {
    const sub = submissionsById.get(entry.docId);
    if (!sub) return;
    dispatch({
      type: 'OPEN_BRACKET_VIEW',
      view: {
        docId: sub.id,
        ownerDisplayName: sub.displayName,
        bracketName: sub.draft.bracketName.trim() || 'Untitled bracket',
        draft: sub.draft,
      },
    });
  };

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
        {!tournamentStarted && status === 'ready' && (
          <span className="leaderboard-page__stub" aria-hidden="true">
            Live scores activate once tournament results are entered.
          </span>
        )}
      </header>
      {status === 'loading' && (
        <div className="leaderboard__empty">
          <p>Loading leaderboard…</p>
        </div>
      )}
      {status === 'error' && (
        <div className="leaderboard__empty">
          <p>Couldn't load the leaderboard. {error}</p>
        </div>
      )}
      {status === 'ready' && (
        <LeaderboardTable entries={entries} onView={handleView} />
      )}
    </div>
  );
}
