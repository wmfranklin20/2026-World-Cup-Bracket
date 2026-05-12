# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An interactive March-Madness-style bracket app for the **2026 FIFA Men's World Cup** (the first 48-team format). Users predict group standings, pick which 8 of 12 third-place teams advance, click winners through the knockout bracket, and predict a final score. The submitted bracket is scored against actual results and ranked on a leaderboard.

**Frontend is complete; backend is deferred.** Submission goes nowhere yet, leaderboard renders mock data. A follow-up plan will wire Firebase Firestore for persistence + scoring.

## Commands

```
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build  (type errors fail the build)
npm run lint       # ESLint flat config
npm run preview    # serve the production build
```

No test framework. Don't add one without asking.

## Architecture

**State:** Single `useReducer` + Context. `AppState = { activePage, currentStep, draft, submission, toast }`. `AppProvider` (`src/context/AppProvider.tsx`) wires the reducer + 150ms-debounced localStorage save. `useAppState()` is the standard consumer hook.

**Pages:** Two — Bracket (the wizard) and Leaderboard. Selected via `state.activePage`, conditionally rendered in `src/App.tsx`. No router.

**Wizard:** 3 steps in `src/ui/pages/BracketPage.tsx`: `groups → knockout → review`. The Groups step embeds the third-place advancement choice directly on each `GroupCard` (per-group toggle on the 3rd-place row); `canAdvance('groups')` requires exactly 8 third-place teams picked. The Knockout step renders the full bracket and the `FinalScorePanel` inline; `canAdvance('knockout')` requires all knockout winners picked AND a valid final score. Step order and labels are defined as `WIZARD_STEPS` / `WIZARD_STEP_LABEL` in `src/types/domain.ts`. Navigation lives in `src/ui/navs/WizardNav.tsx` and replaces the standard `Footer` only while `activePage === 'bracket'`. Per-step gating runs through `src/lib/validation.ts` (`canAdvance`, `canSubmit`).

**Bracket resolution:** The draft only stores `groupPicks`, `thirdPlaceAdvancers` (8 of 12 group IDs), `knockoutPicks` (winner per match), and the final score. R32 matchups are **derived** by `src/lib/bracketSeeding.ts:resolveR32` from `src/data/bracketStructure.json`. R16+ matchups derive from the previous round's winners. Never store resolved matchups in state.

**Third-place → R32 mapping (FIFA combinations table):** The 8 R32 matches whose away side is a 3rd-place team use `{ kind: 'thirdPlace', host: <A|B|D|E|G|I|K|L> }` (the same letter as the home group winner). `bracketSeeding.ts` resolves each such slot by sorting the user's 8 `thirdPlaceAdvancers`, joining them into a key (e.g. `'EFGHIJKL'`), and looking up that key in `src/data/thirdPlaceCombinations.json` — the canonical FIFA table of 495 = C(12,8) advancement permutations. The combination's `matchups['1<host>']` returns the group whose 3rd-place team is assigned to that R32 slot. When fewer than 8 advancers are selected, the lookup returns `null` and the slot renders as an `EmptyTeamSlot` with label "3rd-place team"; once 8 are selected the label becomes "3rd of {group}". Regenerate the combinations JSON from the raw FIFA table via `node scripts/buildThirdPlaceCombinations.mjs`.

**Cascade pruning:** Any draft mutation that could invalidate downstream picks (a group reorder, a 3rd-place toggle, or a knockout winner change) runs `pruneKnockoutPicks` in `appReducer.ts`. Every knockout pick is re-resolved; if the stored winner no longer matches either side of the resolved matchup, that pick (and the toast `"Some later picks were reset..."`) clears. The final score also clears when the final winner is dropped.

**Drag-and-drop (group ordering):** Native HTML5 DnD, no library. `src/hooks/useDragReorder.ts` is a reusable hook returning `getRowProps(id)` for each row. Drop side (`'above' | 'below'`) is computed from `clientY` vs. the row's mid-Y. `GroupCard` (`src/ui/panels/GroupCard.tsx`) consumes it and dispatches `GROUP_REORDER`.

**Knockout layout:** 5-column CSS grid (R32 / R16 / QF / SF / F) in `src/ui/panels/KnockoutBracket.css`. Each column uses `justify-content: space-around` and a flex multiplier (`r16 = 2`, `qf = 4`, …) so matches center against the next round. A `::before` pseudo-element on each slot draws the connector line back to the previous round. Below 1100px the layout collapses to one column per round.

## Data files (placeholders — user must update)

- `src/data/teams.json` — 48-team field. Each team: `{ id, name, code, flag, confederation }`. `flag` is currently an emoji string; swap to `/flags/<code>.svg` once SVG flags exist in `public/flags/`.
- `src/data/groups.json` — `{ "A": [team1, team2, team3, team4], ... }`. The order is the seeded pot order and also becomes the default `groupPicks`; users reorder from there.
- `src/data/bracketStructure.json` — defines each of the 16 R32 matchups (`groupRank` or `thirdPlace` slot) plus the R16/QF/SF/F feeder chain. **Third-place slots 1–8 are filled in alphabetical order of the groups the user picks to advance.** This rule is a simplification — update if FIFA publishes the official 3rd-place mapping table.

`teamLookup.ts:getTeam` falls back to `null` for unknown ids so the app boots on partial data.

## Conventions (inherited from the portfolio, with one exception)

This project follows `../../.claude/CLAUDE.md` and `../../.claude/CLAUDE-UI-STRATEGY.md`: no third-party UI libraries, no CSS-in-JS, no state libraries, no router, no path aliases, no icon libraries (sprite at `public/icons.svg`), Outfit 300/600, plain CSS co-located one-per-component.

**The exception: mobile breakpoints.** The user explicitly opted in to a responsive layout, breaking the 2026 desktop-first rule. Breakpoints are constrained to:

- `@media (max-width: 1100px)` — narrow-desktop fallback (group grid → 2 cols, bracket → single column)
- `@media (max-width: 768px)` — phone (group grid → 1 col, bracket col-body → 1 col, hide labels, collapse paddings)

Don't sprinkle media queries everywhere — they live in `GroupGrid.css`, `KnockoutBracket.css`, `ReviewSummary.css`, `ThirdPlacePicker.css`, `Header.css`, and the wizard chrome only.

## Persistence

Draft state only — never `activePage` / `currentStep` / `submission`. Refresh always lands on Bracket step 1. Key: `wc2026-bracket:draft:v1`. Schema version on the draft object; mismatch → `loadDraft` returns null and seeds from `groups.json`.

The app is **light-mode only** — no theme toggle, no dark tokens, no `prefers-color-scheme` override. `color-scheme: light only` is set on `:root`.

## Out of scope (next plan)

- Firebase Auth, Firestore, security rules
- Submission write + dedup-by-name
- Live leaderboard fetch + ranking
- Scoring algorithm (per-round points, finalScore tiebreaker)
- Submission deadline / read-only post-deadline state
- Per-bracket public share URL

The submission lifecycle in `appReducer.ts` (`SET_SUBMISSION_STATUS`) is the seam — backend work plugs into that action's handler without restructuring the frontend.
