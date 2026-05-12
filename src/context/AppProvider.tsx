import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { AppContext } from './appContext';
import { appReducer, createInitialState } from '../reducers/appReducer';
import { loadDraft, saveDraftDebounced } from '../lib/persistence';

interface Props {
  children: ReactNode;
}

export function AppProvider({ children }: Props) {
  const [state, dispatch] = useReducer(
    appReducer,
    undefined,
    () => createInitialState(loadDraft() ?? undefined),
  );

  useEffect(() => {
    saveDraftDebounced(state.draft);
  }, [state.draft]);

  useEffect(() => {
    if (!state.toast) return;
    const id = window.setTimeout(
      () => dispatch({ type: 'SET_TOAST', message: null }),
      3500,
    );
    return () => window.clearTimeout(id);
  }, [state.toast]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
