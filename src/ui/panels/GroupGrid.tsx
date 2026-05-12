import { GROUP_IDS } from '../../types/domain';
import { GroupCard } from './GroupCard';
import './GroupGrid.css';

export function GroupGrid() {
  return (
    <div className="group-grid">
      {GROUP_IDS.map((id) => (
        <GroupCard key={id} groupId={id} />
      ))}
    </div>
  );
}
