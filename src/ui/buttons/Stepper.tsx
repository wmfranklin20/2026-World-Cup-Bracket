import './Stepper.css';

interface Props {
  label: string;
  value: number | null;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
}

export function Stepper({ label, value, min = 0, max = 20, onChange }: Props) {
  const display = value ?? 0;
  const canDecrement = display > min;
  const canIncrement = display < max;
  return (
    <div className="stepper">
      <span className="stepper__label">{label}</span>
      <div className="stepper__controls">
        <button
          type="button"
          className="stepper__btn"
          onClick={() => canDecrement && onChange(display - 1)}
          disabled={!canDecrement}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="number"
          className="stepper__input"
          value={value === null ? '' : value}
          min={min}
          max={max}
          step={1}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              onChange(0);
              return;
            }
            const n = Math.max(min, Math.min(max, Math.floor(Number(raw))));
            if (!Number.isNaN(n)) onChange(n);
          }}
        />
        <button
          type="button"
          className="stepper__btn"
          onClick={() => canIncrement && onChange(display + 1)}
          disabled={!canIncrement}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
