import { useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { AppContext } from './appContext';
import { appReducer, createInitialState } from '../reducers/appReducer';
import {
  loadPersistedState,
  runOneTimeReset,
  savePersistedStateDebounced,
} from '../lib/persistence';
import { loadIdentity, saveIdentity } from '../lib/identity';
import { auth } from '../lib/firebase';

interface Props {
  children: ReactNode;
}

export function AppProvider({ children }: Props) {
  const [state, dispatch] = useReducer(appReducer, undefined, () => {
    runOneTimeReset();
    const persisted = loadPersistedState();
    return createInitialState({
      drafts: persisted?.drafts,
      activeDraftSlot: persisted?.activeDraftSlot,
      submittedSlots: persisted?.submittedSlots,
      identity: loadIdentity(),
    });
  });
  const [authUid, setAuthUid] = useState<string | null>(
    auth.currentUser?.uid ?? null,
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUid(user.uid);
      } else {
        setAuthUid(null);
        signInAnonymously(auth).catch((err) => {
          console.error('Anonymous sign-in failed', err);
        });
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    savePersistedStateDebounced({
      drafts: state.drafts,
      activeDraftSlot: state.activeDraftSlot,
      submittedSlots: state.submittedSlots,
    });
  }, [state.drafts, state.activeDraftSlot, state.submittedSlots]);

  useEffect(() => {
    if (state.identity) saveIdentity(state.identity);
  }, [state.identity]);

  useEffect(() => {
    if (!state.toast) return;
    const id = window.setTimeout(
      () => dispatch({ type: 'SET_TOAST', message: null }),
      3500,
    );
    return () => window.clearTimeout(id);
  }, [state.toast]);

  const value = useMemo(
    () => ({ state, dispatch, authUid }),
    [state, authUid],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
