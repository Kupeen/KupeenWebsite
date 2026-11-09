import { useMemo, useState } from "react";
import type { Loaded } from "../api";
import { DepartureBoard } from "../components/DepartureBoard";
import { Kicker } from "../components/Kicker";
import { Ticket } from "../components/Ticket";
import { FACEBOOK_PAGE_URL } from "../content/site";
import { groupByMonth, type Departure } from "../lib/board";

/** Perron 2: the departure board with every coming event, and the ticket for the one picked. */
export function Departures({ number, departures }: { number: number; departures: Loaded<Departure[]> }) {
  const [rollKey, setRollKey] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);

  const list = useMemo(() => (departures.state === "ready" ? departures.data : []), [departures]);
  const months = useMemo(() => groupByMonth(list), [list]);
  const picked = list.find((d) => d.id === pickedId) ?? list[0] ?? null;
  const pick = (departure: Departure) => {
    if (departure.id !== picked?.id) setTicketOpen(false);
    setPickedId(departure.id);
  };

  let message = null;
  if (departures.state === "loading") message = "HENTER AFGANGE …";
  else if (departures.state === "failed") message = <>Tavlen kunne ikke hentes lige nu. Prøv igen senere, eller <a href={FACEBOOK_PAGE_URL}>se programmet på Facebook</a>.</>;
  else if (list.length === 0) message = <>Ingen afgange på tavlen lige nu. <a href={FACEBOOK_PAGE_URL}>Se Kupéens Facebook-side</a>.</>;

  return (
    <section id="aktiviteter" className="wrap departures">
      <Kicker number={number} colour="var(--gold)">
        PERRON {number} · AKTIVITETER
      </Kicker>
      <div className="departures-head">
        <h2 className="heading" style={{ color: "var(--gold)" }}>
          Afgange fra Kupéen
        </h2>
        {list.length > 0 && (
          <button type="button" className="outline-button" onClick={() => setRollKey((k) => k + 1)}>
            ↻ Rul tavlen
          </button>
        )}
      </div>
      <div className="departures-stack">
        <DepartureBoard months={months} selectedId={picked?.id ?? null} onPick={pick} rollKey={rollKey} message={message} />
        {picked && <Ticket departure={picked} open={ticketOpen} onToggle={() => setTicketOpen((open) => !open)} />}
        <div className="timetable-note">
          <strong>KØREPLAN · ÅBNINGSTIDER</strong>
          <span>Åbningstiderne følger events.</span>
          <a href={FACEBOOK_PAGE_URL}>Se Kupéens Facebook-side for en opdateret kalender</a>
        </div>
      </div>
    </section>
  );
}
