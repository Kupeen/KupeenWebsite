import type { CSSProperties } from "react";
import { AF_MED_FOR, CONTACT_EMAIL, IDEAS_TEXT, VOLUNTEER_TEXT } from "../content/site";

/**
 * The second part of »Om os«: everyone on the train staff is a volunteer. Not a section of its own (no menu entry),
 * but it keeps the anchor #frivillig, and #gode-ideer for the old site's address.
 */
export function Volunteers() {
  return (
    <div id="frivillig" className="volunteers">
      <p className="volunteers-label">FRIVILLIG</p>
      <h3 className="heading" style={{ color: "var(--teal)", marginBottom: 24 }}>
        Hele togpersonalet er frivillige
      </h3>
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
          <h4>Gode ideer? Din idé!</h4>
          <p>{IDEAS_TEXT}</p>
          <a href={`mailto:${CONTACT_EMAIL}`}>Kontakt os</a>
        </div>
      </div>
    </div>
  );
}
