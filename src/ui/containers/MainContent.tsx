import type { ReactNode } from 'react';
import './MainContent.css';

interface Props {
  children: ReactNode;
}

export function MainContent({ children }: Props) {
  return <div className="main-content">{children}</div>;
}
