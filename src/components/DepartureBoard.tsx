// The departure board: every coming event as a row of split-flap tiles, grouped by month. It scrolls; the month
// buttons above it jump to a month and show which month is at the top.

import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { boardText, BOARD_WIDTH, COLUMNS, departuresLabel, NARROW_BOARD_WIDTH, rollDuration, tilesAt, type BoardMonth, type Departure, type Tile } from "../lib/board";
import { boardDate, timeText } from "../lib/dates";

const HEAD_HEIGHT = 44;
const MONTH_HEIGHT = 38;
/** With more rows than this, the board scrolls and fades out at the bottom. */
const ROWS_IN_VIEW = 8;

interface Props {
  months: BoardMonth[];
  selectedId: string | null;
  onPick: (departure: Departure) => void;
  /** Changes when »Rul tavlen« is pressed: the tiles roll again. */
  rollKey: number;
  /** Shown instead of rows while loading, after a failure or when there is nothing. */
  message?: ReactNode;
}

export function DepartureBoard({ months, selectedId, onPick, rollKey, message }: Props) {
  const departures = useMemo(() => months.flatMap((m) => m.departures), [months]);
  const narrow = useMediaQuery("(max-width: 720px)");
  const rows = useMemo(() => {
    const width = narrow ? NARROW_BOARD_WIDTH : BOARD_WIDTH;
    return departures.map((d) => ({ departure: d, time: timeText(d.start), date: boardDate(d.start), title: boardText(d.title, width) }));
  }, [departures, narrow]);
  const time = useRoll(rollKey, useMemo(() => rollDuration(rows), [rows]));

  const board = useRef<HTMLDivElement>(null);
  const jumpUntil = useRef(0);
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const [atEnd, setAtEnd] = useState(false);
  const shownMonth = months.some((m) => m.key === activeMonth) ? activeMonth : (months[0]?.key ?? null);

  usePassWheelToPage(board);

  const onScroll = () => {
    const element = board.current;
    if (!element) return;
    setAtEnd(element.scrollTop + element.clientHeight >= element.scrollHeight - 4);
    // While the board glides to a month, the highlight stays on that month.
    if (Date.now() < jumpUntil.current) return;
    const line = element.scrollTop + HEAD_HEIGHT + MONTH_HEIGHT + 2;
    let key = months[0]?.key ?? null;
    element.querySelectorAll<HTMLElement>("[data-first-of]").forEach((row) => {
      if (row.offsetTop <= line) key = row.dataset.firstOf ?? key;
    });
    setActiveMonth(key);
  };

  // The board glides to a month once React has shown the picked departure: a scroll started before that update is
  // cut off by it.
  const [jump, setJump] = useState<{ key: string } | null>(null);
  useEffect(() => {
    if (!jump) return;
    const first = board.current?.querySelector<HTMLElement>(`[data-first-of="${jump.key}"]`);
    if (first) board.current?.scrollTo({ top: first.offsetTop - HEAD_HEIGHT - MONTH_HEIGHT, behavior: "smooth" });
  }, [jump]);

  const jumpTo = (month: BoardMonth) => {
    jumpUntil.current = Date.now() + 900;
    setActiveMonth(month.key);
    onPick(month.departures[0]);
    setJump({ key: month.key });
  };

  let rowIndex = -1;
  return (
    <div>
      {months.length > 0 && (
        <nav className="months" aria-label="Spring til en måned">
          <span className="months-label">SPRING TIL</span>
          {months.map((m) => (
            <button key={m.key} type="button" className="month-button" aria-current={m.key === shownMonth ? "true" : "false"} onClick={() => jumpTo(m)}>
              {m.tab}
              <small>{m.departures.length}</small>
            </button>
          ))}
        </nav>
      )}
      <div className="board-frame">
        <div ref={board} className="board" onScroll={onScroll} tabIndex={0} role="region" aria-label="Afgangstavlen, rul ned for at se alle afgange">
          <div className="board-inner">
            <div className="board-head" aria-hidden="true">
              <span>TID</span>
              <span>DATO</span>
              <span className="board-head-title">AFGANG MOD</span>
              <span>STATUS</span>
            </div>
            {message && <div className="board-message">{message}</div>}
            {months.map((month) => (
              <div key={month.key} role="group" aria-label={month.label}>
                <div className="board-month">
                  <span>{month.label}</span>
                  <small>{departuresLabel(month.departures.length)}</small>
                </div>
                {month.departures.map((departure, j) => {
                  rowIndex += 1;
                  const row = rows[rowIndex];
                  const i = rowIndex;
                  return (
                    <button
                      key={departure.id}
                      type="button"
                      className="board-row"
                      data-first-of={j === 0 ? month.key : undefined}
                      aria-pressed={departure.id === selectedId}
                      aria-label={`${departure.title}, ${row.date} kl. ${row.time}`}
                      onClick={() => onPick(departure)}
                    >
                      <span className="tiles">
                        <Tiles tiles={tilesAt(row.time, i, COLUMNS.time, time)} />
                      </span>
                      <span className="tiles">
                        <Tiles tiles={tilesAt(row.date, i, COLUMNS.date, time)} />
                      </span>
                      <span className="board-title">
                        <span
                          className={time === null ? "board-title-track scrolling" : "board-title-track"}
                          style={{
                            // Longer titles get more time, so they run at about the same speed; rows start at different moments.
                            animationDuration: `${(8 + departure.title.length * 0.22).toFixed(1)}s`,
                            animationDelay: `${(1.5 + (i % 8) * 0.9).toFixed(1)}s`,
                          }}
                        >
                          <Tiles tiles={tilesAt(row.title, i, COLUMNS.title, time)} />
                        </span>
                      </span>
                      <span className="board-status" style={{ color: departure.ticketUrl ? "var(--tomato)" : "var(--teal)" }}>
                        {departure.ticketUrl ? "KØB BILLET" : "TIL TIDEN"}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {departures.length > ROWS_IN_VIEW && !atEnd && <div className="board-fade" aria-hidden="true" />}
      </div>
      {departures.length > ROWS_IN_VIEW && <div className="board-hint">Rul ned i tavlen for at se alle {departures.length} afgange.</div>}
    </div>
  );
}

function Tiles({ tiles }: { tiles: Tile[] }) {
  return tiles.map((tile, i) => (
    <span key={i} className={tile.turning ? `flap flap-${tile.turning}` : "flap"}>
      {tile.char === " " ? " " : tile.char}
    </span>
  ));
}

/** Whether the media query matches, kept up to date when the window changes. */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/**
 * Milliseconds since the board started rolling, or null once every tile has settled. It rolls when the rows change
 * and when `rollKey` changes; with reduced motion it shows the settled board at once.
 */
function useRoll(rollKey: number, duration: number): number | null {
  const [time, setTime] = useState<number | null>(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTime(null);
      return;
    }
    const started = performance.now();
    setTime(0);
    const timer = setInterval(() => {
      const elapsed = performance.now() - started;
      if (elapsed > duration) {
        clearInterval(timer);
        setTime(null);
      } else {
        setTime(elapsed);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [rollKey, duration]);
  return time;
}

/**
 * Scrolling past the top or bottom of the board carries on with the page in the same movement. On its own a browser
 * keeps one wheel or trackpad movement on the board until the movement ends, so the page would only move with the
 * next one. Touch screens hand the next swipe to the page by themselves. The listener is added by hand, not as
 * onWheel, because it must be able to stop the browser's own scrolling (React's wheel listeners are passive).
 */
function usePassWheelToPage(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const board = ref.current;
    if (!board) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const dy = event.deltaMode === 1 ? event.deltaY * 40 : event.deltaMode === 2 ? event.deltaY * board.clientHeight : event.deltaY;
      const atTop = board.scrollTop <= 0;
      const atBottom = board.scrollTop + board.clientHeight >= board.scrollHeight - 1;
      if (!((dy > 0 && atBottom) || (dy < 0 && atTop))) return;
      const page = document.scrollingElement ?? document.documentElement;
      const before = page.scrollTop;
      page.scrollBy({ top: dy, behavior: "instant" });
      // Only when the page really moved; otherwise (the page is at its own end) the browser keeps the movement.
      if (page.scrollTop !== before) event.preventDefault();
    };
    board.addEventListener("wheel", onWheel, { passive: false });
    return () => board.removeEventListener("wheel", onWheel);
  }, [ref]);
}
