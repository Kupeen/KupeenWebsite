import type { CSSProperties } from "react";
import { Kicker } from "../components/Kicker";
import { AF_MED_FOR, CONTACT_EMAIL, IDEAS_TEXT, VOLUNTEER_TEXT } from "../content/site";

/** »Frivillig«: everyone on the train staff is a volunteer. */
export function Volunteers({ number }: { number: number }) {
  return (
    <section id="frivillig" className="wrap volunteers">
      <Kicker number={number} colour="var(--teal)">
        FRIVILLIG
      </Kicker>
      <h2 className="heading" style={{ color: "var(--teal)", marginBottom: 24 }}>
        Hele togpersonalet er frivillige
      </h2>
      <div className="volunteers-text">
        <p>{VOLUNTEER_TEXT}</p>
        <div className="af-med-for">
          {AF_MED_FOR.map((card) => (
            <div key={card.word} style={{ "--colour": card.colour } as CSSProperties}>
              <strong>{card.word}</strong>
              <span>{card.rest}</span>
              <p>{card.text}</p>
            </div>
          ))}
        </div>
        <div id="gode-ideer" className="ideas">
          <h3>Gode ideer? Din idé!</h3>
          <p>{IDEAS_TEXT}</p>
          <a href={`mailto:${CONTACT_EMAIL}`}>Kontakt os</a>
        </div>
      </div>
    </section>
  );
}
