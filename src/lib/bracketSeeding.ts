import structureData from '../data/bracketStructure.json';
import thirdPlaceCombinationsData from '../data/thirdPlaceCombinations.json';
import type {
  BracketDraft,
  BracketStructure,
  FinalMatchId,
  GroupId,
  MatchId,
  QFMatchId,
  R16MatchId,
  R32MatchId,
  ResolvedMatchup,
  SFMatchId,
  SlotRef,
  TeamId,
  ThirdPlaceCombination,
} from '../types/domain';
import { ROUND_OF } from '../types/domain';

export const BRACKET_STRUCTURE = structureData as unknown as BracketStructure;

const THIRD_PLACE_COMBINATIONS = (
  thirdPlaceCombinationsData as unknown as {
    combinations: ThirdPlaceCombination[];
  }
).combinations;

const COMBINATIONS_BY_KEY = new Map<string, ThirdPlaceCombination>(
  THIRD_PLACE_COMBINATIONS.map((c) => [c.key, c]),
);

export function findThirdPlaceCombination(
  advancingGroups: readonly GroupId[],
): ThirdPlaceCombination | null {
  if (advancingGroups.length !== 8) return null;
  const key = [...advancingGroups].sort().join('');
  return COMBINATIONS_BY_KEY.get(key) ?? null;
}

export function thirdPlaceGroupForHost(
  host: string,
  advancingGroups: readonly GroupId[],
): GroupId | null {
  const combo = findThirdPlaceCombination(advancingGroups);
  if (!combo) return null;
  return combo.matchups[`1${host}`] ?? null;
}

const R32_IDS = Object.keys(BRACKET_STRUCTURE.r32) as R32MatchId[];
const R16_IDS = Object.keys(BRACKET_STRUCTURE.r16) as R16MatchId[];
const QF_IDS = Object.keys(BRACKET_STRUCTURE.qf) as QFMatchId[];
const SF_IDS = Object.keys(BRACKET_STRUCTURE.sf) as SFMatchId[];
const FINAL_ID: FinalMatchId = 'F';

export const ALL_MATCH_IDS: MatchId[] = [
  ...R32_IDS,
  ...R16_IDS,
  ...QF_IDS,
  ...SF_IDS,
  FINAL_ID,
];

function slotLabel(ref: SlotRef, draft: BracketDraft): string {
  switch (ref.kind) {
    case 'groupRank':
      return `${ref.rank === 1 ? '1st' : '2nd'} of ${ref.group}`;
    case 'thirdPlace': {
      const group = thirdPlaceGroupForHost(ref.host, draft.thirdPlaceAdvancers);
      return group ? `3rd of ${group}` : '3rd-place team';
    }
    case 'winnerOf':
      return `Winner of ${ref.match}`;
  }
}

function resolveSlot(ref: SlotRef, draft: BracketDraft): TeamId | null {
  if (ref.kind === 'groupRank') {
    const group = draft.groupPicks[ref.group];
    if (!group) return null;
    return group[ref.rank - 1] ?? null;
  }
  if (ref.kind === 'thirdPlace') {
    const groupId = thirdPlaceGroupForHost(ref.host, draft.thirdPlaceAdvancers);
    if (!groupId) return null;
    const standings = draft.groupPicks[groupId];
    return standings?.[2] ?? null;
  }
  return draft.knockoutPicks[ref.match] ?? null;
}

export function resolveR32(
  matchId: R32MatchId,
  draft: BracketDraft,
): ResolvedMatchup {
  const rule = BRACKET_STRUCTURE.r32[matchId];
  return {
    matchId,
    round: 'R32',
    home: resolveSlot(rule.home, draft),
    away: resolveSlot(rule.away, draft),
    homeLabel: slotLabel(rule.home, draft),
    awayLabel: slotLabel(rule.away, draft),
    winner: draft.knockoutPicks[matchId] ?? null,
  };
}

export function resolveR16(
  matchId: R16MatchId,
  draft: BracketDraft,
): ResolvedMatchup {
  const [homeFeed, awayFeed] = BRACKET_STRUCTURE.r16[matchId];
  return {
    matchId,
    round: 'R16',
    home: draft.knockoutPicks[homeFeed] ?? null,
    away: draft.knockoutPicks[awayFeed] ?? null,
    homeLabel: `Winner of ${homeFeed}`,
    awayLabel: `Winner of ${awayFeed}`,
    winner: draft.knockoutPicks[matchId] ?? null,
  };
}

export function resolveQF(
  matchId: QFMatchId,
  draft: BracketDraft,
): ResolvedMatchup {
  const [homeFeed, awayFeed] = BRACKET_STRUCTURE.qf[matchId];
  return {
    matchId,
    round: 'QF',
    home: draft.knockoutPicks[homeFeed] ?? null,
    away: draft.knockoutPicks[awayFeed] ?? null,
    homeLabel: `Winner of ${homeFeed}`,
    awayLabel: `Winner of ${awayFeed}`,
    winner: draft.knockoutPicks[matchId] ?? null,
  };
}

export function resolveSF(
  matchId: SFMatchId,
  draft: BracketDraft,
): ResolvedMatchup {
  const [homeFeed, awayFeed] = BRACKET_STRUCTURE.sf[matchId];
  return {
    matchId,
    round: 'SF',
    home: draft.knockoutPicks[homeFeed] ?? null,
    away: draft.knockoutPicks[awayFeed] ?? null,
    homeLabel: `Winner of ${homeFeed}`,
    awayLabel: `Winner of ${awayFeed}`,
    winner: draft.knockoutPicks[matchId] ?? null,
  };
}

export function resolveFinal(draft: BracketDraft): ResolvedMatchup {
  const [homeFeed, awayFeed] = BRACKET_STRUCTURE.f;
  return {
    matchId: FINAL_ID,
    round: 'F',
    home: draft.knockoutPicks[homeFeed] ?? null,
    away: draft.knockoutPicks[awayFeed] ?? null,
    homeLabel: `Winner of ${homeFeed}`,
    awayLabel: `Winner of ${awayFeed}`,
    winner: draft.knockoutPicks[FINAL_ID] ?? null,
  };
}

export function resolveMatchup(
  matchId: MatchId,
  draft: BracketDraft,
): ResolvedMatchup {
  const round = ROUND_OF[matchId];
  if (round === 'R32') return resolveR32(matchId as R32MatchId, draft);
  if (round === 'R16') return resolveR16(matchId as R16MatchId, draft);
  if (round === 'QF') return resolveQF(matchId as QFMatchId, draft);
  if (round === 'SF') return resolveSF(matchId as SFMatchId, draft);
  return resolveFinal(draft);
}

export function getR32Order(): R32MatchId[] {
  return R32_IDS;
}
export function getR16Order(): R16MatchId[] {
  return R16_IDS;
}
export function getQFOrder(): QFMatchId[] {
  return QF_IDS;
}
export function getSFOrder(): SFMatchId[] {
  return SF_IDS;
}

export function getFeederMatches(matchId: MatchId): MatchId[] | null {
  const round = ROUND_OF[matchId];
  if (round === 'R32') return null;
  if (round === 'R16') return [...BRACKET_STRUCTURE.r16[matchId as R16MatchId]];
  if (round === 'QF') return [...BRACKET_STRUCTURE.qf[matchId as QFMatchId]];
  if (round === 'SF') return [...BRACKET_STRUCTURE.sf[matchId as SFMatchId]];
  return [...BRACKET_STRUCTURE.f];
}

export function findDownstreamMatch(parent: MatchId): MatchId | null {
  for (const id of R16_IDS) {
    if (BRACKET_STRUCTURE.r16[id].includes(parent as R32MatchId)) return id;
  }
  for (const id of QF_IDS) {
    if (BRACKET_STRUCTURE.qf[id].includes(parent as R16MatchId)) return id;
  }
  for (const id of SF_IDS) {
    if (BRACKET_STRUCTURE.sf[id].includes(parent as QFMatchId)) return id;
  }
  if (BRACKET_STRUCTURE.f.includes(parent as SFMatchId)) return FINAL_ID;
  return null;
}

export function collectDownstreamChain(matchId: MatchId): MatchId[] {
  const chain: MatchId[] = [];
  let cursor: MatchId | null = matchId;
  while (cursor) {
    const next = findDownstreamMatch(cursor);
    if (!next) break;
    chain.push(next);
    cursor = next;
  }
  return chain;
}
