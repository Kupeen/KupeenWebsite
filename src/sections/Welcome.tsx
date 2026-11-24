import { Kicker } from "../components/Kicker";
import { WELCOME_TEXT } from "../content/site";
import type { Departure } from "../lib/board";
import { departureText } from "../lib/dates";

/** Section 1: welcome, with the next event. (The train now runs in »Om os«, where its carriages can be picked.) */
export function Welcome({ number, next }: { number: number; next: Departure | null }) {
  return (
    <section id="forside" className="welcome">
      <div className="wrap welcome-grid">
        <div className="welcome-main">
          <Kicker number={number} colour="var(--tomato)">
            {next ? (
              <>
                NÆSTE ARRANGEMENT <span className="blink">{departureText(next.start)}</span>
              </>
            ) : (
              <>VELKOMMEN</>
            )}
          </Kicker>
          <h1>
            Velkommen <span>ombord</span> i Kupéen
          </h1>
          <p className="welcome-text">{WELCOME_TEXT}</p>
          <ul className="chips" aria-label="Kupéen er">
            <li>AF nærområdet</li>
            <li>MED nærområdet</li>
            <li>FOR nærområdet – og alle andre</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
