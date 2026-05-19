import { GROUP_IDS, type BracketDraft } from '../../types/domain';
import { GroupCard } from './GroupCard';
import './GroupGrid.css';

interface Props {
  draft: BracketDraft;
  locked?: boolean;
}

export function GroupGrid({ draft, locked = false }: Props) {
  return (
    <div className="group-grid">
      {GROUP_IDS.map((id) => (
        <GroupCard key={id} groupId={id} draft={draft} locked={locked} />
      ))}
    </div>
  );
}
