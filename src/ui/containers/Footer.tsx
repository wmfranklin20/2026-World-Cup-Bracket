import type { ReactNode } from 'react';
import './Footer.css';

interface Props {
  children?: ReactNode;
}

export function Footer({ children }: Props) {
  if (!children) {
    return (
      <footer className="app-footer app-footer--empty">
        <span className="app-footer__hint">
          Drafts auto-save to this browser. No account required.
        </span>
      </footer>
    );
  }
  return <footer className="app-footer">{children}</footer>;
}
