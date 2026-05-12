import type { InputHTMLAttributes } from 'react';
import './TextInput.css';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
}

export function TextInput({
  label,
  value,
  onChange,
  hint,
  id,
  ...rest
}: Props) {
  const inputId = id ?? `txt-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <label className="text-input" htmlFor={inputId}>
      <span className="text-input__label">{label}</span>
      <input
        id={inputId}
        type="text"
        className="text-input__field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
      {hint && <span className="text-input__hint">{hint}</span>}
    </label>
  );
}
