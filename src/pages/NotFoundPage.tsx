import { WhistleIcon } from "../components/Icons";
import { Train, useTrain } from "../components/Train";
import { Footer } from "../sections/Footer";

/** Split-flap tiles for a short word, drawn like the departure board's. */
function Flaps({ text, label }: { text: string; label?: string }) {
  return (
    <span className="tiles" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {Array.from(text).map((char, i) => (
        <span key={i} className="flap">
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}

/**
 * Netlify shows 404.html for every address that does not exist. The address may be anything, so links and files here
 * are absolute. While people are here, they can still send the train round.
 */
export function NotFoundPage() {
  const train = useTrain();
  return (
    <div className="page">
      <main className="lost">
        <div className="wrap lost-grid">
          <div className="lost-main">
            <p className="lost-kicker">SPOR 404 · AFGANG IKKE FUNDET</p>
            <h1>
              Toget kører <span>ikke</span> herfra
            </h1>
            <p className="lost-text">
              Den side, du leder efter, er kørt – eller har aldrig holdt på denne station. Måske er sporet skiftet, eller der har sneget sig en
              stavefejl ind i adressen.
            </p>
            <div className="lost-links">
              <a className="solid-button" href="/">
                Til forsiden
              </a>
              <a className="line-button" href="/#aktiviteter">
                Se køreplanen
              </a>
            </div>
          </div>
          <div className="lost-side">
            <div className="lost-board">
              <div className="lost-board-head">
                <span>TID</span>
                <span>TIL</span>
                <span>STATUS</span>
              </div>
              <div className="lost-board-row">
                <Flaps text="--.--" label="Intet tidspunkt" />
                <Flaps text="404" label="Spor 404" />
                <span className="lost-status blink">AFLYST</span>
              </div>
            </div>
            <button type="button" className="whistle" onClick={train.toggle}>
              <WhistleIcon />
              {train.running ? "Stop toget" : "Fløjt afgang!"}
            </button>
            <div className="whistle-note">Mens du er her: tryk på fløjten og send toget en tur.</div>
          </div>
        </div>
        <Train trainRef={train.ref} moving={train.moving} />
      </main>
      <Footer />
    </div>
  );
}
