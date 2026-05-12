import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT = resolve(__dirname, 'third-place-combinations.txt');
const OUTPUT = resolve(__dirname, '..', 'src', 'data', 'thirdPlaceCombinations.json');

const MATCHUP_KEYS = ['1A', '1B', '1D', '1E', '1G', '1I', '1K', '1L'];

const lines = readFileSync(INPUT, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);

const combinations = lines.map((line) => {
  const tokens = line.split(/\s+/);
  if (tokens.length !== 17) {
    throw new Error(`Expected 17 tokens, got ${tokens.length}: ${line}`);
  }
  const id = parseInt(tokens[0], 10);
  const advancingGroups = tokens.slice(1, 9);
  const matchupTokens = tokens.slice(9, 17);
  const matchups = {};
  for (let i = 0; i < 8; i += 1) {
    const t = matchupTokens[i];
    if (!/^3[A-L]$/.test(t)) {
      throw new Error(`Bad matchup token "${t}" on row ${id}`);
    }
    matchups[MATCHUP_KEYS[i]] = t.slice(1);
  }
  const sorted = [...advancingGroups].sort();
  return {
    id,
    advancingGroups: sorted,
    key: sorted.join(''),
    matchups,
  };
});

if (combinations.length !== 495) {
  throw new Error(`Expected 495 combinations, got ${combinations.length}`);
}

const seenKeys = new Set();
for (const c of combinations) {
  if (seenKeys.has(c.key)) {
    throw new Error(`Duplicate key ${c.key} at id ${c.id}`);
  }
  seenKeys.add(c.key);
}

const output = {
  _note:
    "Official FIFA 2026 third-place advancement table. Each entry lists the 8 groups whose 3rd-place team advances to the Round of 32 (advancingGroups), and which 3rd-place team faces each of the 8 group-winner R32 hosts (matchups: 1X -> Y means group X's winner faces group Y's 3rd-place team). 'key' is the sorted-and-joined advancingGroups string, intended for O(1) lookup. 495 entries = C(12, 8).",
  matchupKeys: MATCHUP_KEYS,
  combinations,
};

writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n');
console.log(`Wrote ${combinations.length} combinations to ${OUTPUT}`);
