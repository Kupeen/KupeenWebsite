import { WhistleIcon } from "../components/Icons";
import { Kicker } from "../components/Kicker";
import { Train, useTrain } from "../components/Train";
import { WELCOME_TEXT } from "../content/site";
import type { Departure } from "../lib/board";
import { departureText } from "../lib/dates";
import type { NewsItem } from "../lib/news";

/** Perron 1: welcome, the latest news, and the train that leaves on the whistle. */
export function Welcome({ number, next, latest, onNews }: { number: number; next: Departure | null; latest: NewsItem | null; onNews: () => void }) {
  const train = useTrain();
  const cover = latest ? (latest.photos[0]?.src ?? latest.videoStill) : null;
  return (
    <section id="forside" className="welcome">
      <div className="wrap welcome-grid">
        <div className="welcome-main">
          <Kicker number={number} colour="var(--tomato)">
            {next ? (
              <>
                PERRON {number} · NÆSTE AFGANG <span className="blink">{departureText(next.start)}</span>
              </>
            ) : (
              <>PERRON {number} · VELKOMMEN</>
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
          {latest && (
            <a className="latest" href="#nyheder" onClick={onNews}>
              {cover && <img src={cover} alt="" />}
              <span style={{ minWidth: 0 }}>
                <span className="latest-label">SENESTE NYT · {latest.date}</span>
                <span className="latest-title">{latest.title}</span>
                <span className="latest-more">{latest.photos.length > 0 ? "Læs og se billederne ↓" : "Læs mere ↓"}</span>
              </span>
            </a>
          )}
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
