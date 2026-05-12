import { useAppState } from '../../hooks/useAppState';
import './Toast.css';

export function Toast() {
  const { state, dispatch } = useAppState();
  if (!state.toast) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{state.toast}</span>
      <button
        type="button"
        className="toast__close"
        onClick={() => dispatch({ type: 'SET_TOAST', message: null })}
        aria-label="Dismiss"
      >
        <svg className="icon">
          <use href="/icons.svg#x-mark" />
        </svg>
      </button>
    </div>
  );
}
