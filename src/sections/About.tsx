import { useState, type CSSProperties } from "react";
import { Kicker } from "../components/Kicker";
import { KupeTrain } from "../components/KupeTrain";
import { ABOUT_TEXT, OFFERS } from "../content/site";
import { Volunteers } from "./Volunteers";

/**
 * »Om os« in two parts. First »Vælg din kupé«: a train with one carriage per thing Kupéen offers; picking a carriage,
 * or the arrows at the ends of the track, drives it to the middle, and its description shows under the track. Then
 * the volunteers who run it all.
 */
export function About({ number }: { number: number }) {
  const [chosen, setChosen] = useState(0);
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
      {/* The arrows stay at the ends of the track whatever is shown, so they never move under the pointer. */}
      <div className="kupe-stage">
        <KupeTrain kupeer={OFFERS} chosen={chosen} onChoose={setChosen} />
        <button type="button" className="kupe-arrow previous" onClick={() => step(-1)} aria-label="Forrige kupé">
          ‹
        </button>
        <button type="button" className="kupe-arrow next" onClick={() => step(1)} aria-label="Næste kupé">
          ›
        </button>
      </div>
      {/* All five descriptions share one spot, the chosen one visible: the box is as tall as the longest, so nothing
          below it moves when another kupé is picked. Only the chosen one is in the live region. */}
      <div className="kupe-info">
        {OFFERS.map((offer, i) => (
          <KupeCard key={offer.title} index={i} offer={offer} hidden />
        ))}
        <div aria-live="polite" className="kupe-info-shown">
          <KupeCard index={chosen} offer={OFFERS[chosen]} />
        </div>
      </div>
      <Volunteers />
    </section>
  );
}

function KupeCard({ index, offer, hidden }: { index: number; offer: (typeof OFFERS)[number]; hidden?: boolean }) {
  return (
    <div
      className={hidden ? "compartment-shown kupe-card-size" : "compartment-shown"}
      aria-hidden={hidden ? true : undefined}
      style={{ "--colour": offer.colour } as CSSProperties}
    >
      <span aria-hidden="true">{index + 1}</span>
      <div>
        <h3>
          Kupé {index + 1} · {offer.title}
        </h3>
        <p>{offer.text}</p>
      </div>
    </div>
  );
}
