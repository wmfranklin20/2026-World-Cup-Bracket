import type {
  BracketDraft,
  GroupPicks,
  ResultsBracket,
  Round,
  TeamId,
} from '../types/domain';
import { GROUP_IDS, ROUND_OF } from '../types/domain';
import { ALL_MATCH_IDS, resolveMatchup } from './bracketSeeding';

export const POINTS = {
  groupPosition: 1,
  thirdPlaceAdvancer: 3,
  knockout: { R32: 10, R16: 20, QF: 40, SF: 80, F: 160 } as Record<
    Round,
    number
  >,
  finalScoreExact: 25,
} as const;

export interface ScoreBreakdown {
  group: number;
  R32: number;
  R16: number;
  QF: number;
  SF: number;
  F: number;
}

export interface ScoreResult {
  score: number;
  potentialRemaining: number;
  accuracy: number;
  decisionsCount: number;
  finalScoreBonus: number;
  breakdown: ScoreBreakdown;
}

const PLACEHOLDER: [TeamId, TeamId, TeamId, TeamId] = ['', '', '', ''];

function buildResultsAsDraft(results: ResultsBracket): BracketDraft {
  const groupPicks = {} as GroupPicks;
  for (const g of GROUP_IDS) {
    groupPicks[g] = results.groupResults[g] ?? PLACEHOLDER;
  }
  return {
    schemaVersion: 1,
    bracketName: '',
    groupPicks,
    thirdPlaceAdvancers: results.thirdPlaceAdvancers ?? [],
    knockoutPicks: results.knockoutResults,
    finalScore: results.finalScore,
  };
}

function isTeamStillAlive(
  teamId: TeamId,
  resultsAsDraft: BracketDraft,
  results: ResultsBracket,
): boolean {
  if (!teamId) return false;
  for (const id of ALL_MATCH_IDS) {
    if (!results.matchDecided[id]) continue;
    const resolved = resolveMatchup(id, resultsAsDraft);
    if (resolved.home === teamId || resolved.away === teamId) {
      if (results.knockoutResults[id] !== teamId) return false;
    }
  }
  return true;
}

export function scoreBracket(
  submission: BracketDraft,
  results: ResultsBracket,
): ScoreResult {
  let potential = 0;
  let correct = 0;
  let decisions = 0;
  let finalScoreBonus = 0;
  const breakdown: ScoreBreakdown = {
    group: 0,
    R32: 0,
    R16: 0,
    QF: 0,
    SF: 0,
    F: 0,
  };

  for (const g of GROUP_IDS) {
    if (results.groupDecided[g]) {
      const actual = results.groupResults[g];
      if (actual) {
        const userPicks = submission.groupPicks[g];
        for (let i = 0; i < 4; i += 1) {
          decisions += 1;
          if (userPicks[i] === actual[i]) {
            breakdown.group += POINTS.groupPosition;
            correct += 1;
          }
        }
      }
    } else {
      potential += 4 * POINTS.groupPosition;
    }
  }

  if (results.thirdPlaceAdvancers) {
    const actualAdvancers = new Set(results.thirdPlaceAdvancers);
    for (const g of submission.thirdPlaceAdvancers) {
      decisions += 1;
      if (actualAdvancers.has(g)) {
        breakdown.group += POINTS.thirdPlaceAdvancer;
        correct += 1;
      }
    }
  } else {
    potential +=
      submission.thirdPlaceAdvancers.length * POINTS.thirdPlaceAdvancer;
  }

  const resultsAsDraft = buildResultsAsDraft(results);
  for (const id of ALL_MATCH_IDS) {
    const round = ROUND_OF[id];
    const pts = POINTS.knockout[round];
    const userPick = submission.knockoutPicks[id];
    if (results.matchDecided[id]) {
      decisions += 1;
      if (userPick && userPick === results.knockoutResults[id]) {
        breakdown[round] += pts;
        correct += 1;
      }
    } else if (userPick && isTeamStillAlive(userPick, resultsAsDraft, results)) {
      potential += pts;
    }
  }

  const { home: userHome, away: userAway } = submission.finalScore;
  const { home: actualHome, away: actualAway } = results.finalScore;
  if (results.finalDecided) {
    decisions += 1;
    if (
      userHome !== null &&
      userAway !== null &&
      userHome === actualHome &&
      userAway === actualAway
    ) {
      breakdown.F += POINTS.finalScoreExact;
      finalScoreBonus = POINTS.finalScoreExact;
      correct += 1;
    }
  } else {
    potential += POINTS.finalScoreExact;
  }

  const score =
    breakdown.group +
    breakdown.R32 +
    breakdown.R16 +
    breakdown.QF +
    breakdown.SF +
    breakdown.F;

  const accuracy = decisions === 0 ? 0 : correct / decisions;

  return {
    score,
    potentialRemaining: potential,
    accuracy,
    decisionsCount: decisions,
    finalScoreBonus,
    breakdown,
  };
}
