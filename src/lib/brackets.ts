import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { canSubmit } from './validation';
import type { AppState, BracketDraft } from '../types/domain';

const BRACKETS_COLLECTION = 'brackets';
const DOC_SCHEMA_VERSION = 1 as const;

export interface SubmissionDoc {
  id: string;
  ownerUid: string;
  displayName: string;
  submittedAt: number;
  draft: BracketDraft;
}

export async function submitBracket(
  state: AppState,
  authUid: string,
): Promise<string> {
  if (!canSubmit(state)) {
    throw new Error('Bracket is not ready to submit.');
  }
  if (!state.identity) {
    throw new Error('Missing identity.');
  }
  const { displayName, email } = state.identity;
  const payload = {
    ownerUid: authUid,
    displayName,
    email,
    emailKey: email.trim().toLowerCase(),
    status: 'submitted' as const,
    schemaVersion: DOC_SCHEMA_VERSION,
    submittedAt: serverTimestamp(),
    clientSubmittedAt: Date.now(),
    draft: state.draft,
  };
  const ref = await addDoc(collection(db, BRACKETS_COLLECTION), payload);
  return ref.id;
}

export async function getAllSubmittedBrackets(): Promise<SubmissionDoc[]> {
  const q = query(
    collection(db, BRACKETS_COLLECTION),
    where('status', '==', 'submitted'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    const submittedAt =
      data.submittedAt instanceof Timestamp
        ? data.submittedAt.toMillis()
        : typeof data.clientSubmittedAt === 'number'
          ? data.clientSubmittedAt
          : 0;
    return {
      id: d.id,
      ownerUid: data.ownerUid,
      displayName: data.displayName,
      submittedAt,
      draft: data.draft as BracketDraft,
    };
  });
}
