import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type Variant = 'primary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...rest
}: Props) {
  const cls = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}
