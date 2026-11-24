// »Vælg din kupé«: a train whose carriages are the things Kupéen offers. Picking a carriage drives the train until
// that carriage stands at the platform in the middle of the track; the section shows its description below.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

export interface Kupe {
  short: string;
  colour: string;
}

/** Seconds for a ride of `distance` pixels: short hops are quick, long rides take a little longer. */
const rideSeconds = (distance: number) => Math.min(2.4, 0.7 + distance / 700);

export function KupeTrain({ kupeer, chosen, onChoose }: { kupeer: Kupe[]; chosen: number; onChoose: (index: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const train = useRef<HTMLDivElement>(null);
  const at = useRef<number | null>(null);
  const [moving, setMoving] = useState(false);

  /** Puts the chosen carriage in the middle of the track: driving there, or at once (first time, resize, reduced motion). */
  const place = useCallback(
    (drive: boolean) => {
      const box = track.current;
      const body = train.current;
      const carriage = body?.querySelector<HTMLElement>(`[data-kupe="${chosen}"]`);
      if (!box || !body || !carriage) return;
      const target = Math.round(box.clientWidth / 2 - (carriage.offsetLeft + carriage.offsetWidth / 2));
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const from = at.current;
      const ride = drive && !still && from !== null && from !== target;
      body.style.transition = ride ? `transform ${rideSeconds(Math.abs(target - from)).toFixed(2)}s cubic-bezier(0.45, 0, 0.2, 1)` : "none";
      body.style.transform = `translateX(${target}px)`;
      at.current = target;
      setMoving(ride);
    },
    [chosen],
  );

  useLayoutEffect(() => place(true), [place]);

  // When the track changes width (window, phone turned), the chosen carriage stays in the middle without a ride.
  useEffect(() => {
    const box = track.current;
    if (!box) return;
    const observer = new ResizeObserver(() => place(false));
    observer.observe(box);
    return () => observer.disconnect();
  }, [place]);

  // A carriage out of view (or under the faded ends and the arrows) that gets keyboard focus is driven into view, so
  // focus is never on something unseen.
  const onFocus = (index: number, element: HTMLElement) => {
    const box = track.current?.getBoundingClientRect();
    const own = element.getBoundingClientRect();
    const edge = 72; // the faded end of the track, with its arrow
    if (box && index !== chosen && (own.left < box.left + edge || own.right > box.right - edge)) onChoose(index);
  };

  return (
    <div ref={track} className="kupe-track">
      <div ref={train} className={moving ? "train running" : "train"} onTransitionEnd={() => setMoving(false)}>
        <div className="car engine" aria-hidden="true" style={{ background: "var(--tomato)" }}>
          <div className="puff" />
          <div className="puff" style={{ animationDelay: "0.5s", left: 42 }} />
          <div className="puff" style={{ animationDelay: "1s", left: 28 }} />
          <div className="chimney" />
          <div className="lamp" />
          <div className="window wide">9520</div>
          <div className="wheel" style={{ left: 30 }} />
          <div className="wheel" style={{ right: 18 }} />
        </div>
        {kupeer.map((kupe, i) => (
          <button
            key={kupe.short}
            type="button"
            className="car kupe"
            data-kupe={i}
            aria-pressed={i === chosen}
            aria-label={`Kupé ${i + 1}: ${kupe.short}`}
            style={{ "--colour": kupe.colour } as CSSProperties}
            onClick={() => onChoose(i)}
            onFocus={(event) => onFocus(i, event.currentTarget)}
          >
            <span className="kupe-number" aria-hidden="true">
              {i + 1}
            </span>
            <span className="car-sign" aria-hidden="true">
              {kupe.short}
            </span>
            <span className="wheel" style={{ left: 14 }} aria-hidden="true" />
            <span className="wheel" style={{ right: 14 }} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="track-bed" aria-hidden="true" />
      <div className="track-rail" aria-hidden="true" />
    </div>
  );
}
