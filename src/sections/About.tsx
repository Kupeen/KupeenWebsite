import { useState, type CSSProperties } from "react";
import { Kicker } from "../components/Kicker";
import { ABOUT_TEXT, OFFERS } from "../content/site";

/** Perron 6, »Vælg din kupé«: a carriage with one door per thing Kupéen offers. */
export function About({ number }: { number: number }) {
  const [door, setDoor] = useState(0);
  const shown = OFFERS[door];
  return (
    <section id="om-os" className="wrap about">
      <Kicker number={number} colour="var(--cream)">
        PERRON {number} · OM OS
      </Kicker>
      <h2 className="heading" style={{ color: "var(--cream)", marginBottom: 8 }}>
        Vælg din kupé
      </h2>
      <p className="lead">{ABOUT_TEXT}</p>
      <div className="carriage-scroll">
        <div className="carriage">
          {OFFERS.map((offer, i) => (
            <button
              key={offer.title}
              type="button"
              className="compartment"
              aria-pressed={i === door}
              onClick={() => setDoor(i)}
              style={{ "--colour": offer.colour } as CSSProperties}
            >
              <span className="compartment-door">{i + 1}</span>
              <span className="compartment-title">{offer.title}</span>
            </button>
          ))}
          <div className="carriage-wheel" aria-hidden="true" style={{ left: 60 }} />
          <div className="carriage-wheel" aria-hidden="true" style={{ left: 110 }} />
          <div className="carriage-wheel" aria-hidden="true" style={{ right: 110 }} />
          <div className="carriage-wheel" aria-hidden="true" style={{ right: 60 }} />
        </div>
      </div>
      <div className="compartment-shown" aria-live="polite" style={{ "--colour": shown.colour } as CSSProperties}>
        <span aria-hidden="true">{door + 1}</span>
        <div>
          <h3>
            Kupé {door + 1} · {shown.title}
          </h3>
          <p>{shown.text}</p>
        </div>
      </div>
    </section>
  );
}
