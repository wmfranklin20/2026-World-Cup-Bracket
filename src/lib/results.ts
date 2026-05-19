import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { ResultsBracket } from '../types/domain';

const RESULTS_DOC_PATH = ['results', 'current'] as const;

export function emptyResults(): ResultsBracket {
  return {
    schemaVersion: 1,
    groupResults: {},
    groupDecided: {},
    thirdPlaceAdvancers: null,
    knockoutResults: {},
    matchDecided: {},
    finalScore: { home: null, away: null },
    finalDecided: false,
    updatedAt: 0,
  };
}

export async function fetchResults(): Promise<ResultsBracket> {
  const ref = doc(db, ...RESULTS_DOC_PATH);
  const snap = await getDoc(ref);
  if (!snap.exists()) return emptyResults();
  const data = snap.data();
  const base = emptyResults();
  return {
    schemaVersion: 1,
    groupResults: data.groupResults ?? base.groupResults,
    groupDecided: data.groupDecided ?? base.groupDecided,
    thirdPlaceAdvancers: data.thirdPlaceAdvancers ?? null,
    knockoutResults: data.knockoutResults ?? base.knockoutResults,
    matchDecided: data.matchDecided ?? base.matchDecided,
    finalScore: data.finalScore ?? base.finalScore,
    finalDecided: Boolean(data.finalDecided),
    updatedAt:
      typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
  };
}
