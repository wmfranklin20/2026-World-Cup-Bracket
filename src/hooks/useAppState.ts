import { useContext } from 'react';
import { AppContext } from '../context/appContext';

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return ctx;
}
