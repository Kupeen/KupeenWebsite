import { WhistleIcon } from "../components/Icons";
import { Kicker } from "../components/Kicker";
import { Train, useTrain } from "../components/Train";
import { WELCOME_TEXT } from "../content/site";
import type { Departure } from "../lib/board";
import { departureText } from "../lib/dates";

/** Perron 1: welcome, and the train that leaves on the whistle. */
export function Welcome({ number, next }: { number: number; next: Departure | null }) {
  const train = useTrain();
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
        <div className="welcome-side">
          <button type="button" className="whistle" onClick={train.toggle}>
            <WhistleIcon />
            {train.running ? "Stop toget" : "Fløjt afgang!"}
          </button>
          <div className="whistle-note">Toget holder ved perronen. Tryk på fløjten, så kører det.</div>
        </div>
      </div>
      <Train trainRef={train.ref} moving={train.moving} />
    </section>
  );
}
