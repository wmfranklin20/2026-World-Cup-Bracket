import {
  getQFOrder,
  getR16Order,
  getR32Order,
  getSFOrder,
} from '../../lib/bracketSeeding';
import {
  ROUND_LABEL,
  type BracketDraft,
  type MatchId,
  type Round,
} from '../../types/domain';
import { FinalScorePanel } from './FinalScorePanel';
import { MatchSlot } from './MatchSlot';
import './KnockoutBracket.css';

interface Props {
  draft: BracketDraft;
  readOnly?: boolean;
}

interface ColumnDef {
  round: Round;
  ids: MatchId[];
  side: 'left' | 'right';
  key: string;
}

const LEFT_COLUMNS: ColumnDef[] = [
  { round: 'R32', ids: getR32Order().slice(0, 8), side: 'left', key: 'r32-l' },
  { round: 'R16', ids: getR16Order().slice(0, 4), side: 'left', key: 'r16-l' },
  { round: 'QF', ids: getQFOrder().slice(0, 2), side: 'left', key: 'qf-l' },
  { round: 'SF', ids: getSFOrder().slice(0, 1), side: 'left', key: 'sf-l' },
];

const RIGHT_COLUMNS: ColumnDef[] = [
  { round: 'SF', ids: getSFOrder().slice(1, 2), side: 'right', key: 'sf-r' },
  { round: 'QF', ids: getQFOrder().slice(2, 4), side: 'right', key: 'qf-r' },
  { round: 'R16', ids: getR16Order().slice(4, 8), side: 'right', key: 'r16-r' },
  { round: 'R32', ids: getR32Order().slice(8, 16), side: 'right', key: 'r32-r' },
];

function BracketColumn({
  round,
  ids,
  side,
  draft,
  readOnly,
}: ColumnDef & { draft: BracketDraft; readOnly: boolean }) {
  return (
    <div
      className={`bracket__col bracket__col--${round.toLowerCase()} bracket__col--${side}`}
    >
      <header className="bracket__col-head">{ROUND_LABEL[round]}</header>
      <div className="bracket__col-body">
        {ids.map((id) => (
          <div key={id} className="bracket__slot">
            <MatchSlot matchId={id} draft={draft} readOnly={readOnly} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function KnockoutBracket({ draft, readOnly = false }: Props) {
  return (
    <div className="bracket" role="grid" aria-label="Knockout bracket">
      {LEFT_COLUMNS.map(({ key, ...col }) => (
        <BracketColumn key={key} {...col} draft={draft} readOnly={readOnly} />
      ))}
      <div className="bracket__col bracket__col--f">
        <header className="bracket__col-head">{ROUND_LABEL.F}</header>
        <div className="bracket__col-body">
          <div className="bracket__final-container">
            <div className="bracket__slot bracket__slot--final">
              <MatchSlot matchId="F" draft={draft} readOnly={readOnly} />
            </div>
            <div className="bracket__final-divider" aria-hidden="true" />
            <FinalScorePanel draft={draft} readOnly={readOnly} />
          </div>
        </div>
      </div>
      {RIGHT_COLUMNS.map(({ key, ...col }) => (
        <BracketColumn key={key} {...col} draft={draft} readOnly={readOnly} />
      ))}
    </div>
  );
}
