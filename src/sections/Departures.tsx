import { useEffect, useMemo, useRef, useState } from "react";
import type { Loaded } from "../api";
import { DepartureBoard } from "../components/DepartureBoard";
import { Kicker } from "../components/Kicker";
import { Ticket } from "../components/Ticket";
import { FACEBOOK_PAGE_URL } from "../content/site";
import { groupByMonth, type Departure } from "../lib/board";

/** Section 2: the ticket for the event picked, and below it the departure board with every coming event. */
export function Departures({ number, departures }: { number: number; departures: Loaded<Departure[]> }) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [picks, setPicks] = useState(0);
  const ticket = useRef<HTMLDivElement>(null);

  const list = useMemo(() => (departures.state === "ready" ? departures.data : []), [departures]);
  const months = useMemo(() => groupByMonth(list), [list]);
  const picked = list.find((d) => d.id === pickedId) ?? list[0] ?? null;
  const pick = (departure: Departure) => {
    if (departure.id !== picked?.id) setTicketOpen(false);
    setPickedId(departure.id);
    setPicks((n) => n + 1);
  };

  // The ticket is above the board. When a row far down the board is picked (on a phone, say), the ticket has scrolled
  // out of sight under the header: bring it back, so the pick visibly does something.
  useEffect(() => {
    const box = ticket.current;
    if (!picks || !box) return;
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 0;
    if (box.getBoundingClientRect().top >= header) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollIntoView({ block: "start", behavior: still ? "instant" : "smooth" });
  }, [picks]);

  let message = null;
  if (departures.state === "loading") message = "HENTER AFGANGE …";
  else if (departures.state === "failed") message = <>Tavlen kunne ikke hentes lige nu. Prøv igen senere, eller <a href={FACEBOOK_PAGE_URL}>se programmet på Facebook</a>.</>;
  else if (list.length === 0) message = <>Ingen afgange på tavlen lige nu. <a href={FACEBOOK_PAGE_URL}>Se Kupéens Facebook-side</a>.</>;

  return (
    <section id="aktiviteter" className="wrap departures">
      <Kicker number={number} colour="var(--gold)">
        AKTIVITETER
      </Kicker>
      <div className="departures-head">
        <h2 className="heading" style={{ color: "var(--gold)" }}>
          Arrangementer i Kupéen
        </h2>
      </div>
      <div className="departures-stack">
        {picked && (
          <div ref={ticket}>
            <Ticket departure={picked} open={ticketOpen} onToggle={() => setTicketOpen((open) => !open)} />
          </div>
        )}
        <DepartureBoard
          months={months}
          selectedId={picked?.id ?? null}
          onPick={pick}
          message={message}
          note="Åbningstider: Følger arrangementer."
        />
      </div>
    </section>
  );
}
