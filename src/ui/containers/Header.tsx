import { TopNav } from "../navs/TopNav";
import "./Header.css";

export function Header() {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <img
          className="app-header__logo"
          src="/2026_FIFA_World_Cup_emblem.svg.png"
          alt="2026 FIFA World Cup emblem"
        />
        <span className="app-header__title">
          2026 PW World Cup Bracket Challenge
        </span>
      </div>
      <TopNav />
    </header>
  );
}
