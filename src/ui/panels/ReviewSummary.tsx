import { useAppState } from '../../hooks/useAppState';
import { resolveFinal } from '../../lib/bracketSeeding';
import { teamName } from '../../lib/teamLookup';
import { GROUP_IDS } from '../../types/domain';
import { TextInput } from '../buttons/TextInput';
import { TeamRow } from '../displays/TeamRow';
import './ReviewSummary.css';

export function ReviewSummary() {
  const { state, dispatch } = useAppState();
  const { draft, submission } = state;
  const final = resolveFinal(draft);
  const submitted = submission.status === 'submitted';

  return (
    <div className="review">
      <header className="review__head">
        <h2>Review &amp; submit</h2>
        <p className="review__sub">
          Confirm your picks below. Once submitted, your bracket joins the
          leaderboard.
        </p>
      </header>

      <section className="review__card">
        <h3>Your name</h3>
        <TextInput
          label="Display name"
          value={draft.displayName}
          onChange={(name) => dispatch({ type: 'SET_DISPLAY_NAME', name })}
          placeholder="How you'll appear on the leaderboard"
          maxLength={32}
          disabled={submitted}
        />
      </section>

      <section className="review__card">
        <h3>Group stage</h3>
        <ul className="review__groups">
          {GROUP_IDS.map((gid) => (
            <li key={gid} className="review__group">
              <span className="review__group-letter">Group {gid}</span>
              <ol className="review__group-list">
                {draft.groupPicks[gid].map((teamId, idx) => (
                  <li key={`${gid}-${idx}`}>
                    <span className="review__rank">{idx + 1}.</span>
                    <TeamRow teamId={teamId} variant="compact" showCode />
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      </section>

      <section className="review__card">
        <h3>Champion</h3>
        {final.winner ? (
          <p className="review__champ">
            🏆 {teamName(final.winner)} beats{' '}
            {teamName(
              final.winner === final.home ? final.away : final.home,
            )}{' '}
            {draft.finalScore.home}–{draft.finalScore.away}
          </p>
        ) : (
          <p className="review__sub">
            No champion yet — pick a winner in the Final step.
          </p>
        )}
      </section>

      {submitted && (
        <div className="review__success">
          ✓ Submitted! Find your bracket on the Leaderboard tab.
        </div>
      )}
    </div>
  );
}
