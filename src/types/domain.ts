export type GroupId =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L';

export const GROUP_IDS: readonly GroupId[] = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
];

export const GROUP_RANKS = [1, 2, 3, 4] as const;
export type GroupRank = (typeof GROUP_RANKS)[number];

export type TeamId = string;

export type Confederation =
  | 'AFC'
  | 'CAF'
  | 'CONCACAF'
  | 'CONMEBOL'
  | 'OFC'
  | 'UEFA';

export interface Team {
  id: TeamId;
  name: string;
  code: string;
  flag: string;
  confederation: Confederation;
}

export type R32MatchId =
  | 'R32-1'
  | 'R32-2'
  | 'R32-3'
  | 'R32-4'
  | 'R32-5'
  | 'R32-6'
  | 'R32-7'
  | 'R32-8'
  | 'R32-9'
  | 'R32-10'
  | 'R32-11'
  | 'R32-12'
  | 'R32-13'
  | 'R32-14'
  | 'R32-15'
  | 'R32-16';

export type R16MatchId =
  | 'R16-1'
  | 'R16-2'
  | 'R16-3'
  | 'R16-4'
  | 'R16-5'
  | 'R16-6'
  | 'R16-7'
  | 'R16-8';

export type QFMatchId = 'QF-1' | 'QF-2' | 'QF-3' | 'QF-4';
export type SFMatchId = 'SF-1' | 'SF-2';
export type FinalMatchId = 'F';

export type MatchId =
  | R32MatchId
  | R16MatchId
  | QFMatchId
  | SFMatchId
  | FinalMatchId;

export type Round = 'R32' | 'R16' | 'QF' | 'SF' | 'F';

export const ROUND_OF: Record<MatchId, Round> = (() => {
  const result = {} as Record<MatchId, Round>;
  for (let i = 1; i <= 16; i += 1) result[`R32-${i}` as R32MatchId] = 'R32';
  for (let i = 1; i <= 8; i += 1) result[`R16-${i}` as R16MatchId] = 'R16';
  for (let i = 1; i <= 4; i += 1) result[`QF-${i}` as QFMatchId] = 'QF';
  for (let i = 1; i <= 2; i += 1) result[`SF-${i}` as SFMatchId] = 'SF';
  result.F = 'F';
  return result;
})();

export const ROUND_LABEL: Record<Round, string> = {
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarterfinals',
  SF: 'Semifinals',
  F: 'Final',
};

export type ThirdPlaceHost = 'A' | 'B' | 'D' | 'E' | 'G' | 'I' | 'K' | 'L';

export const THIRD_PLACE_HOSTS: readonly ThirdPlaceHost[] = [
  'A',
  'B',
  'D',
  'E',
  'G',
  'I',
  'K',
  'L',
];

export type SlotRef =
  | { kind: 'groupRank'; group: GroupId; rank: 1 | 2 }
  | { kind: 'thirdPlace'; host: ThirdPlaceHost }
  | { kind: 'winnerOf'; match: MatchId };

export interface ThirdPlaceCombination {
  id: number;
  advancingGroups: GroupId[];
  key: string;
  matchups: Record<string, GroupId>;
}

export interface BracketStructure {
  r32: Record<R32MatchId, { home: SlotRef; away: SlotRef }>;
  r16: Record<R16MatchId, [R32MatchId, R32MatchId]>;
  qf: Record<QFMatchId, [R16MatchId, R16MatchId]>;
  sf: Record<SFMatchId, [QFMatchId, QFMatchId]>;
  f: [SFMatchId, SFMatchId];
}

export type GroupPicks = Record<GroupId, [TeamId, TeamId, TeamId, TeamId]>;

export interface BracketDraft {
  schemaVersion: 1;
  bracketName: string;
  groupPicks: GroupPicks;
  thirdPlaceAdvancers: GroupId[];
  knockoutPicks: Partial<Record<MatchId, TeamId>>;
  finalScore: { home: number | null; away: number | null };
}

export interface Identity {
  displayName: string;
  email: string;
  submittedCount: number;
}

export type WizardStep = 'groups' | 'knockout';

export const WIZARD_STEPS: readonly WizardStep[] = ['groups', 'knockout'];

export const WIZARD_STEP_LABEL: Record<WizardStep, string> = {
  groups: 'Groups',
  knockout: 'Bracket',
};

export type ActivePage = 'intro' | 'bracket' | 'leaderboard';

export interface SubmissionState {
  status: 'idle' | 'submitting' | 'submitted' | 'error';
  error?: string;
}

export type OverlayKind = 'submit-confirm' | 'post-submit';

export type DraftSlot = 0 | 1;

export interface ViewingBracket {
  docId: string;
  ownerDisplayName: string;
  bracketName: string;
  draft: BracketDraft;
}

export interface AppState {
  activePage: ActivePage;
  currentStep: WizardStep;
  identity: Identity | null;
  draft: BracketDraft;
  drafts: [BracketDraft, BracketDraft];
  activeDraftSlot: DraftSlot;
  submittedSlots: [boolean, boolean];
  submission: SubmissionState;
  toast: string | null;
  overlay: OverlayKind | null;
  viewingBracket: ViewingBracket | null;
}

export interface ResultsBracket {
  schemaVersion: 1;
  groupResults: Partial<Record<GroupId, [TeamId, TeamId, TeamId, TeamId]>>;
  groupDecided: Partial<Record<GroupId, boolean>>;
  thirdPlaceAdvancers: GroupId[] | null;
  knockoutResults: Partial<Record<MatchId, TeamId>>;
  matchDecided: Partial<Record<MatchId, boolean>>;
  finalScore: { home: number | null; away: number | null };
  finalDecided: boolean;
  updatedAt: number;
}

export interface LeaderboardEntry {
  rank: number;
  docId: string;
  ownerUid: string;
  displayName: string;
  finalPickTeamId: TeamId | null;
  score: number;
  potentialRemaining: number;
  accuracy: number;
  decisionsCount: number;
  finalScoreBonus: number;
  submittedAt: number;
  groupPoints: number;
  r32Points: number;
  r16Points: number;
  qfPoints: number;
  sfPoints: number;
  fPoints: number;
  finalScoreHome: number | null;
  finalScoreAway: number | null;
  bracketName: string;
}

export interface ResolvedMatchup {
  matchId: MatchId;
  round: Round;
  home: TeamId | null;
  away: TeamId | null;
  homeLabel: string;
  awayLabel: string;
  winner: TeamId | null;
}
