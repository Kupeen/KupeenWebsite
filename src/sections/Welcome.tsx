import { Kicker } from "../components/Kicker";
import { ADDRESS, WELCOME_TEXT } from "../content/site";
import facadeLarge from "../images/hero-facade-1600.webp";
import facadeSmall from "../images/hero-facade-800.webp";
import type { Departure } from "../lib/board";
import { departureText } from "../lib/dates";

/**
 * Section 1: Kupéen's facade with the »Kupéen holder ÅBENT – kig ind!« board across the whole hero, and the welcome
 * on a yellow card over it: the next event, two ways in, and where to find the house. On phones the photo is a strip
 * above the card.
 */
export function Welcome({ number, next }: { number: number; next: Departure | null }) {
  return (
    <section id="forside" className="welcome">
      <img
        className="welcome-photo"
        src={facadeLarge}
        srcSet={`${facadeSmall} 800w, ${facadeLarge} 1600w`}
        sizes="100vw"
        width={1600}
        height={900}
        fetchPriority="high"
        alt="Kupéens gule murstensfacade på Sverriggårdsvej. På fortovet står en tavle: Kupéen holder åbent – kig ind!"
      />
      <div className="wrap welcome-inner">
        <div className="welcome-card">
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
          <div className="welcome-buttons">
            <a className="solid-button big" href="#aktiviteter">
              Se arrangementer
            </a>
            <a className="line-button big" href="#bliv-medlem">
              Bliv medlem
            </a>
          </div>
          <p className="welcome-address">
            {ADDRESS.street.toUpperCase()} · {ADDRESS.zip} {ADDRESS.town.toUpperCase()} · VED STATIONEN
          </p>
        </div>
      </div>
    </section>
  );
}
