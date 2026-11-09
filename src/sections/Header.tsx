import type { CSSProperties } from "react";
import { StationClock } from "../components/StationClock";
import type { SectionId } from "../content/site";

export interface MenuItem {
  id: SectionId;
  label: string;
  colour: string;
  number: number;
}

/** The old station sign that hangs in Kupéen, the station clock, and the menu: one »perron« per section. */
export function Header({ menu, current, onPick }: { menu: MenuItem[]; current: SectionId; onPick: (id: SectionId) => void }) {
  return (
    <header className="site-header">
      <div className="header-top">
        <div className="brand">
          <div className="sign">
            {/* The lettering is traced from a photo of the sign; the worn navy enamel is drawn. */}
            <img src="/images/skorping-sign.png" alt="Skørping" width={360} height={60} />
            <div className="sign-rail" aria-hidden="true" />
            <div className="sign-bolt" aria-hidden="true" />
            <div className="sign-bolt right" aria-hidden="true" />
          </div>
          <div className="brand-sub">
            VENTESAL · KIOSK
            <br />
            KULTURHUS · 9520
          </div>
        </div>
        <StationClock />
      </div>
      <div className="header-menu">
        <nav aria-label="Hovedmenu">
          <ul className="menu">
            {menu.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => onPick(item.id)}
                  aria-current={item.id === current ? "page" : undefined}
                  style={{ "--colour": item.colour } as CSSProperties}
                >
                  <span className="kicker-number" aria-hidden="true">
                    {item.number}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
