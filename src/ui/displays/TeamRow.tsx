import type { HTMLAttributes, ReactNode } from 'react';
import { teamCode, teamFlag, teamName } from '../../lib/teamLookup';
import type { TeamId } from '../../types/domain';
import './TeamRow.css';

type Variant = 'default' | 'draggable' | 'picked' | 'eliminated' | 'compact';

interface Props extends HTMLAttributes<HTMLDivElement> {
  teamId: TeamId | null;
  variant?: Variant;
  showFlag?: boolean;
  showCode?: boolean;
  advancing?: boolean;
  dim?: boolean;
  trailing?: ReactNode;
  leading?: ReactNode;
}

export function TeamRow({
  teamId,
  variant = 'default',
  showFlag = true,
  showCode = false,
  advancing = false,
  dim = false,
  trailing,
  leading,
  className,
  ...rest
}: Props) {
  const isEmpty = !teamId;
  const cls = [
    'team-row',
    `team-row--${variant}`,
    isEmpty && 'team-row--empty',
    advancing && 'team-row--advancing',
    dim && 'team-row--dim',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} {...rest}>
      {leading && <span className="team-row__leading">{leading}</span>}
      {showFlag && !isEmpty && teamFlag(teamId) && (
        <img
          className="team-row__flag"
          src={teamFlag(teamId)}
          alt=""
          aria-hidden="true"
        />
      )}
      <span className="team-row__name">
        {isEmpty ? '—' : teamName(teamId)}
      </span>
      {showCode && (
        <span className="team-row__code">{teamCode(teamId)}</span>
      )}
      {trailing && <span className="team-row__trailing">{trailing}</span>}
    </div>
  );
}
