// The ticket for the departure picked on the board: picture, date, place, and the event's whole text on »Læs mere«.

import { ADDRESS } from "../content/site";
import type { Departure } from "../lib/board";
import { longDate, timeText } from "../lib/dates";
import { ChevronIcon, ExternalIcon } from "./Icons";
import { RichText } from "./RichText";

export function Ticket({ departure, open, onToggle }: { departure: Departure; open: boolean; onToggle: () => void }) {
  // Events at Kupéen show its address the same way every time; Facebook's place names vary.
  const atKupeen = !departure.place || /kup[eé]en|sverrigg/i.test(departure.place);
  const place = atKupeen ? `${ADDRESS.street}, ${ADDRESS.town}` : departure.place?.replace(/\s+,/g, ",");
  return (
    <div className="ticket">
      <div className="ticket-hole" aria-hidden="true" />
      <div className="ticket-hole right" aria-hidden="true" />
      <div className="ticket-kind">BILLET · ENKELTREJSE</div>
      <h3 className="ticket-route">Kupéen → {departure.title}</h3>
      <div className="ticket-perforation" aria-hidden="true" />
      <div className="ticket-body">
        {departure.image && (
          <img
            className={open ? "ticket-image open" : "ticket-image"}
            src={departure.image}
            alt={`Billede til ${departure.title}`}
            style={{ objectPosition: departure.imagePosition }}
          />
        )}
        <div className="ticket-text">
          <div className="ticket-meta">
            {longDate(departure.start)} · kl. {timeText(departure.start)}
          </div>
          <div className="ticket-meta">{place}</div>
          <div className="button-row">
            {departure.description && (
              <button type="button" className="solid-button" onClick={onToggle} aria-expanded={open} aria-controls="billet-detaljer">
                {open ? "Luk" : "Læs mere"}
                <ChevronIcon open={open} />
              </button>
            )}
            {departure.ticketUrl && (
              <a className="solid-button tomato" href={departure.ticketUrl} target="_blank" rel="noopener noreferrer">
                Køb billet
              </a>
            )}
          </div>
          {open && departure.description && (
            <div id="billet-detaljer" className="ticket-details">
              <p>
                <RichText text={departure.description} />
              </p>
              <a className="line-button" href={departure.facebookUrl} target="_blank" rel="noopener noreferrer">
                Se arrangementet på Facebook
                <ExternalIcon />
              </a>
            </div>
          )}
        </div>
      </div>
      <div className="ticket-note">Klik på en afgang på tavlen for at skrive billetten ud.</div>
    </div>
  );
}
