import { useState, type CSSProperties } from "react";
import { Kicker } from "../components/Kicker";
import { KupeTrain } from "../components/KupeTrain";
import { ABOUT_TEXT, OFFERS } from "../content/site";

/**
 * »Om os« / »Vælg din kupé«: a train with one carriage per thing Kupéen offers. Picking a carriage (or »Forrige« and
 * »Næste« below) drives it to the platform, and its description shows under the track.
 */
export function About({ number }: { number: number }) {
  const [chosen, setChosen] = useState(0);
  const shown = OFFERS[chosen];
  const step = (by: number) => setChosen((i) => (i + by + OFFERS.length) % OFFERS.length);
  return (
    <section id="om-os" className="wrap about">
      <Kicker number={number} colour="var(--cream)">
        OM OS
      </Kicker>
      <h2 className="heading" style={{ color: "var(--cream)", marginBottom: 8 }}>
        Vælg din kupé
      </h2>
      <p className="lead">{ABOUT_TEXT}</p>
      <KupeTrain kupeer={OFFERS} chosen={chosen} onChoose={setChosen} />
      <div className="compartment-shown" aria-live="polite" style={{ "--colour": shown.colour } as CSSProperties}>
        <span aria-hidden="true">{chosen + 1}</span>
        <div>
          <h3>
            Kupé {chosen + 1} · {shown.title}
          </h3>
          <p>{shown.text}</p>
        </div>
        <div className="kupe-steps">
          <button type="button" onClick={() => step(-1)} aria-label="Forrige kupé">
            ‹ Forrige
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Næste kupé">
            Næste ›
          </button>
        </div>
      </div>
    </section>
  );
}
