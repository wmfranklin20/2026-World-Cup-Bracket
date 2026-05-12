import './EmptyTeamSlot.css';

interface Props {
  label: string;
}

export function EmptyTeamSlot({ label }: Props) {
  return <div className="empty-slot">{label}</div>;
}
