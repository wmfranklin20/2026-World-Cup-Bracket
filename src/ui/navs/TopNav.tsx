import { useAppState } from '../../hooks/useAppState';
import type { ActivePage } from '../../types/domain';
import './TopNav.css';

const ITEMS: { id: ActivePage; label: string }[] = [
  { id: 'bracket', label: 'Bracket' },
  { id: 'leaderboard', label: 'Leaderboard' },
];

export function TopNav() {
  const { state, dispatch } = useAppState();
  return (
    <nav className="top-nav" aria-label="Primary">
      {ITEMS.map((item) => {
        const active = state.activePage === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`top-nav__item${active ? ' top-nav__item--active' : ''}`}
            onClick={() =>
              dispatch({ type: 'SET_ACTIVE_PAGE', page: item.id })
            }
            aria-current={active ? 'page' : undefined}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
