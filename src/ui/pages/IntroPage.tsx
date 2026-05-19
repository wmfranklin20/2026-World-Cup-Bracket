import { useState } from 'react';
import { useAppState } from '../../hooks/useAppState';
import {
  isIdentityEmailValid,
  isIdentityNameValid,
} from '../../lib/validation';
import { Button } from '../buttons/Button';
import { Stepper } from '../buttons/Stepper';
import { TextInput } from '../buttons/TextInput';
import { TeamRow } from '../displays/TeamRow';
import './IntroPage.css';

const TEMPLATE_BRACKET_NAMES: [string, string] = ['1st Bracket', '2nd Bracket'];

type IntroStep =
  | 'identity'
  | 'groups'
  | 'thirdPlace'
  | 'knockout'
  | 'finalScore';

const TUTORIAL_ORDER: IntroStep[] = [
  'identity',
  'groups',
  'thirdPlace',
  'knockout',
  'finalScore',
];

const RANK_LABEL = ['1st', '2nd', '3rd', '4th'];

interface TutorialCopy {
  title: string;
  body: string;
}

const TUTORIAL_COPY: Record<Exclude<IntroStep, 'identity'>, TutorialCopy> = {
  groups: {
    title: 'Order each group',
    body: 'Drag and drop the teams within each group to set your predicted 1st through 4th place finish.',
  },
  thirdPlace: {
    title: 'Pick the third-place teams',
    body: 'After ordering each group, pick exactly 8 of the 12 third-place teams that you think will advance to the Round of 32 by toggling the row marked “3rd” on each group card.',
  },
  knockout: {
    title: 'Click your way through the bracket',
    body: 'Click a team in each match to advance them to the next round. Your picks cascade through the bracket — changing a winner may reset later picks downstream.',
  },
  finalScore: {
    title: 'Predict the final score',
    body: "Once you've picked a champion, enter your predicted final score. It's used as the leaderboard tiebreaker.",
  },
};

function resolveBracketName(input: string, fallback: string): string {
  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function GroupsPreview() {
  const teams: { id: string; rank: 0 | 1 | 2 | 3 }[] = [
    { id: 'MEX', rank: 0 },
    { id: 'KOR', rank: 1 },
    { id: 'CZE', rank: 2 },
    { id: 'RSA', rank: 3 },
  ];
  return (
    <section className="group-card" aria-hidden="true">
      <header className="group-card__header">
        <span className="group-card__letter">Group A</span>
        <span className="group-card__hint">Drag to predict finish</span>
      </header>
      <ol className="group-card__list">
        {teams.map(({ id, rank }) => (
          <li key={id} className="group-card__slot">
            <span className="group-card__rank">{RANK_LABEL[rank]}</span>
            <div className="group-card__team">
              <TeamRow
                teamId={id}
                variant="default"
                advancing={rank < 2}
                dim={rank === 3}
                trailing={
                  <span className="group-card__trailing">
                    <svg className="group-card__handle" aria-hidden="true">
                      <use href="/icons.svg#drag-handle" />
                    </svg>
                  </span>
                }
              />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ThirdPlacePreview() {
  const teams: { id: string; rank: 0 | 1 | 2 | 3 }[] = [
    { id: 'MEX', rank: 0 },
    { id: 'KOR', rank: 1 },
    { id: 'CZE', rank: 2 },
    { id: 'RSA', rank: 3 },
  ];
  return (
    <section className="group-card" aria-hidden="true">
      <header className="group-card__header">
        <span className="group-card__letter">Group A</span>
      </header>
      <ol className="group-card__list">
        {teams.map(({ id, rank }) => {
          const isThird = rank === 2;
          const isFourth = rank === 3;
          const advancing = rank < 2 || isThird;
          return (
            <li key={id} className="group-card__slot">
              <span className="group-card__rank">{RANK_LABEL[rank]}</span>
              <div className="group-card__team">
                <TeamRow
                  teamId={id}
                  variant="default"
                  advancing={advancing}
                  dim={isFourth}
                  trailing={
                    <span className="group-card__trailing">
                      {isThird && (
                        <span
                          className="group-card__advance group-card__advance--on group-card__advance--locked"
                          aria-hidden="true"
                        >
                          <svg
                            className="group-card__advance-icon"
                            aria-hidden="true"
                          >
                            <use href="/icons.svg#check" />
                          </svg>
                        </span>
                      )}
                      <svg className="group-card__handle" aria-hidden="true">
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

function KnockoutPreview() {
  return (
    <div className="intro-page__knockout-preview" aria-hidden="true">
      <article className="match-slot">
        <span className="match-slot__id">R32-1</span>
        <div className="match-slot__sides">
          <div className="match-slot__side match-slot__side--winner">
            <TeamRow teamId="MEX" variant="picked" showCode />
          </div>
          <div className="match-slot__side">
            <TeamRow teamId="KOR" variant="eliminated" showCode />
          </div>
        </div>
      </article>
      <article className="match-slot">
        <span className="match-slot__id">R32-2</span>
        <div className="match-slot__sides">
          <div className="match-slot__side">
            <TeamRow teamId="CZE" variant="default" showCode />
          </div>
          <div className="match-slot__side">
            <TeamRow teamId="RSA" variant="default" showCode />
          </div>
        </div>
      </article>
    </div>
  );
}

function FinalScorePreview() {
  return (
    <div className="final-panel" aria-hidden="true">
      <h2>Final Score Prediction</h2>
      <div className="final-panel__board">
        <TeamRow teamId="BRA" variant="picked" />
        <div className="final-panel__sep">v</div>
        <TeamRow teamId="ARG" variant="default" />
        <Stepper label="Brazil" value={3} onChange={() => {}} />
        <Stepper label="Argentina" value={1} onChange={() => {}} />
      </div>
    </div>
  );
}

const PREVIEW_FOR: Record<
  Exclude<IntroStep, 'identity'>,
  () => React.ReactElement
> = {
  groups: GroupsPreview,
  thirdPlace: ThirdPlacePreview,
  knockout: KnockoutPreview,
  finalScore: FinalScorePreview,
};

export function IntroPage() {
  const { state, dispatch } = useAppState();
  const [step, setStep] = useState<IntroStep>('identity');
  const [name, setName] = useState(state.identity?.displayName ?? '');
  const [email, setEmail] = useState(state.identity?.email ?? '');
  const [bracketName1, setBracketName1] = useState(state.drafts[0].bracketName);
  const [bracketName2, setBracketName2] = useState(state.drafts[1].bracketName);
  const [showErrors, setShowErrors] = useState(false);

  const nameValid = isIdentityNameValid(name);
  const emailValid = isIdentityEmailValid(email);
  const ready = nameValid && emailValid;

  const stepIndex = TUTORIAL_ORDER.indexOf(step);
  const goNext = () => {
    const next = TUTORIAL_ORDER[stepIndex + 1];
    if (next) setStep(next);
  };
  const goBack = () => {
    const prev = TUTORIAL_ORDER[stepIndex - 1];
    if (prev) setStep(prev);
  };

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) {
      setShowErrors(true);
      return;
    }
    setStep('groups');
  };

  const handleStart = () => {
    const resolved1 = resolveBracketName(bracketName1, TEMPLATE_BRACKET_NAMES[0]);
    const resolved2 = resolveBracketName(bracketName2, TEMPLATE_BRACKET_NAMES[1]);
    dispatch({
      type: 'SET_IDENTITY',
      identity: {
        displayName: name.trim(),
        email: email.trim(),
        submittedCount: state.identity?.submittedCount ?? 0,
      },
    });
    dispatch({ type: 'SET_BRACKET_NAME', name: resolved1, slot: 0 });
    dispatch({ type: 'SET_BRACKET_NAME', name: resolved2, slot: 1 });
    dispatch({ type: 'SET_ACTIVE_PAGE', page: 'bracket' });
  };

  if (step === 'identity') {
    return (
      <div className="intro-page">
        <form
          className="intro-page__card"
          onSubmit={handleIdentitySubmit}
          noValidate
        >
          <header className="intro-page__head">
            <h1>Welcome to the 2026 World Cup Bracket Challenge</h1>
            <p>
              Enter your name and email to get started. You can also name each
              of your two brackets — leave them blank and we'll use the
              defaults.
            </p>
          </header>
          <div className="intro-page__fields">
            <TextInput
              label="Name"
              value={name}
              onChange={setName}
              placeholder="How you'll appear on the leaderboard"
              autoComplete="name"
              maxLength={32}
              required
            />
            {showErrors && !nameValid && (
              <p className="intro-page__error">
                Name must be at least 2 characters.
              </p>
            )}
            <TextInput
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
              required
            />
            {showErrors && !emailValid && (
              <p className="intro-page__error">
                Enter a valid email address.
              </p>
            )}
            <TextInput
              label="1st Bracket Name"
              value={bracketName1}
              onChange={setBracketName1}
              placeholder={TEMPLATE_BRACKET_NAMES[0]}
              maxLength={40}
            />
            <TextInput
              label="2nd Bracket Name"
              value={bracketName2}
              onChange={setBracketName2}
              placeholder={TEMPLATE_BRACKET_NAMES[1]}
              maxLength={40}
            />
          </div>
          <div className="intro-page__actions">
            <Button type="submit" variant="primary" disabled={!ready}>
              Fill out a bracket
              <svg className="icon" aria-hidden="true">
                <use href="/icons.svg#chevron-right" />
              </svg>
            </Button>
          </div>
        </form>
      </div>
    );
  }

  const copy = TUTORIAL_COPY[step];
  const Preview = PREVIEW_FOR[step];
  const isLast = step === 'finalScore';

  return (
    <div className="intro-page">
      <div className="intro-page__card">
        <header className="intro-page__head">
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
        </header>
        <div className="intro-page__preview" inert>
          <Preview />
        </div>
        <div className="intro-page__actions intro-page__actions--split">
          <Button variant="ghost" onClick={goBack}>
            <svg className="icon" aria-hidden="true">
              <use href="/icons.svg#chevron-left" />
            </svg>
            Back
          </Button>
          <Button variant="primary" onClick={isLast ? handleStart : goNext}>
            {isLast ? 'Start' : 'Next'}
            <svg className="icon" aria-hidden="true">
              <use href="/icons.svg#chevron-right" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
