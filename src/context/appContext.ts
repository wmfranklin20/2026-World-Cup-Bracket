import { createContext } from 'react';
import type { AppState } from '../types/domain';
import type { Action } from '../reducers/appReducer';

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

export const AppContext = createContext<AppContextValue | null>(null);
