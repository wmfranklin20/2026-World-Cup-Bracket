import type { ReactNode } from 'react';
import './AppContainer.css';

interface Props {
  header: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function AppContainer({ header, footer, children }: Props) {
  return (
    <div className="app-container">
      {header}
      <main className="app-container__main">{children}</main>
      {footer}
    </div>
  );
}
