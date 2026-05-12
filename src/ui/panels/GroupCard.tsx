import { useAppState } from '../../hooks/useAppState';
import { useDragReorder } from '../../hooks/useDragReorder';
import { REQUIRED_THIRD_PLACE } from '../../lib/validation';
import type { GroupId, TeamId } from '../../types/domain';
import { TeamRow } from '../displays/TeamRow';
import './GroupCard.css';

interface Props {
  groupId: GroupId;
}

const RANK_LABEL = ['1st', '2nd', '3rd', '4th'];

export function GroupCard({ groupId }: Props) {
  const { state, dispatch } = useAppState();
  const teams = state.draft.groupPicks[groupId];
  const thirdPlaceAdvancing = state.draft.thirdPlaceAdvancers.includes(groupId);
  const isThirdPlaceFull =
    state.draft.thirdPlaceAdvancers.length >= REQUIRED_THIRD_PLACE;

  const { getRowProps } = useDragReorder<TeamId>({
    ids: teams,
    onReorder: (teamId, toIndex) =>
      dispatch({ type: 'GROUP_REORDER', group: groupId, teamId, toIndex }),
  });

  const toggleThirdPlace = () =>
    dispatch({ type: 'TOGGLE_THIRD_PLACE', group: groupId });

  return (
    <section
      className="group-card"
      aria-labelledby={`group-${groupId}-title`}
    >
      <header className="group-card__header">
        <span className="group-card__letter" id={`group-${groupId}-title`}>
          Group {groupId}
        </span>
        <span className="group-card__hint">Drag to predict finish</span>
      </header>
      <ol className="group-card__list">
        {teams.map((teamId, idx) => {
          const isThirdPlace = idx === 2;
          const isFourthPlace = idx === 3;
          const advancing =
            idx < 2 || (isThirdPlace && thirdPlaceAdvancing);
          const dim =
            isFourthPlace || (isThirdPlace && !thirdPlaceAdvancing);
          const toggleDisabled =
            isThirdPlace && !thirdPlaceAdvancing && isThirdPlaceFull;

          return (
            <li
              key={teamId || `empty-${idx}`}
              className="group-card__slot"
              {...(teamId ? getRowProps(teamId) : {})}
            >
              <span className="group-card__rank">{RANK_LABEL[idx]}</span>
              <div className="group-card__team">
                <TeamRow
                  teamId={teamId}
                  variant="default"
                  advancing={advancing}
                  dim={dim}
                  trailing={
                    <span className="group-card__trailing" draggable={false}>
                      {isThirdPlace && (
                        <button
                          type="button"
                          className={[
                            'group-card__advance',
                            thirdPlaceAdvancing &&
                              'group-card__advance--on',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={toggleThirdPlace}
                          onMouseDown={(e) => e.stopPropagation()}
                          disabled={toggleDisabled}
                          aria-pressed={thirdPlaceAdvancing}
                          aria-label={
                            thirdPlaceAdvancing
                              ? `Remove Group ${groupId} 3rd-place team from the advancers`
                              : `Advance Group ${groupId} 3rd-place team to the knockout stage`
                          }
                          title={
                            toggleDisabled
                              ? `Already advancing 8 third-place teams`
                              : thirdPlaceAdvancing
                                ? 'Advancing — click to remove'
                                : 'Click to advance to the Round of 32'
                          }
                        >
                          {thirdPlaceAdvancing ? (
                            <>
                              <svg
                                className="group-card__advance-icon"
                                aria-hidden="true"
                              >
                                <use href="/icons.svg#check" />
                              </svg>
                              <span>Advancing</span>
                            </>
                          ) : (
                            <span>Advance</span>
                          )}
                        </button>
                      )}
                      <svg
                        className="group-card__handle"
                        aria-hidden="true"
                      >
                        <use href="/icons.svg#drag-handle" />
                      </svg>
                    </span>
                  }
                />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
