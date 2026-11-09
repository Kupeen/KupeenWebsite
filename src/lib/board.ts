// The departure board: which events it shows, grouped by month, and how its split-flap tiles turn.

import type { FacebookEvent } from "../../netlify/lib/types";
import { monthKey, monthLabel, parseFacebookDate } from "./dates";
import { isWebUrl } from "./text";

/** How long an event without an end time counts as going on. */
const ASSUMED_LENGTH_MS = 3 * 60 * 60 * 1000;

export interface Departure {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  place: string | null;
  ticketUrl: string | null;
  image: string | null;
  /** CSS object-position for the cover, from Facebook's offsets. */
  imagePosition: string;
  facebookUrl: string;
}

export function toDeparture(event: FacebookEvent): Departure {
  const start = parseFacebookDate(event.start_time);
  const end = event.end_time ? parseFacebookDate(event.end_time) : new Date(start.getTime() + ASSUMED_LENGTH_MS);
  return {
    id: event.id,
    title: event.name.trim(),
    description: event.description?.trim() ?? "",
    start,
    end,
    place: event.place?.name?.trim() || null,
    ticketUrl: isWebUrl(event.ticket_uri) ? event.ticket_uri : null,
    image: event.cover?.source ?? null,
    imagePosition: `${event.cover?.offset_x ?? 50}% ${event.cover?.offset_y ?? 50}%`,
    facebookUrl: `https://www.facebook.com/events/${encodeURIComponent(event.id)}`,
  };
}

/**
 * The events that are not over yet by the visitor's clock, soonest first. The server's list is cached for up to an
 * hour, so an event that ended since is dropped here.
 */
export function upcomingDepartures(events: FacebookEvent[], now: Date): Departure[] {
  return events
    .map(toDeparture)
    .filter((d) => !Number.isNaN(d.start.getTime()) && d.end.getTime() > now.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

export interface BoardMonth {
  key: string;
  /** »NOVEMBER 2026«, the divider on the board */
  label: string;
  /** »NOV 2026«, the button above it */
  tab: string;
  departures: Departure[];
}

export function groupByMonth(departures: Departure[]): BoardMonth[] {
  const months: BoardMonth[] = [];
  for (const departure of departures) {
    const key = monthKey(departure.start);
    let month = months.at(-1);
    if (month?.key !== key) {
      month = { key, label: monthLabel(departure.start, "long"), tab: monthLabel(departure.start, "short"), departures: [] };
      months.push(month);
    }
    month.departures.push(departure);
  }
  return months;
}

export const departuresLabel = (count: number) => (count === 1 ? "1 AFGANG" : `${count} AFGANGE`);

// ---- The split-flap tiles ----
// The board starts empty; then every tile leafs through its flaps until it shows its own character, like the
// boards on old stations. A tile starts a little after the one to its left and the row above it.

export const BOARD_WIDTH = 22;
/** On a phone the title gets its own line, with room for fewer tiles. */
export const NARROW_BOARD_WIDTH = 16;
/** The flaps of one tile, in the order they turn. Other characters appear at once when their tile starts. */
export const FLAP_ORDER = Array.from(" ABCDEÉFGHIJKLMNOPQRSTUVWXYZÆØÅ0123456789.-:/·&'!?");
/** Milliseconds per flap; the last few before the right character take longer, so the tile eases in. */
const FLAP_MS = 90;
const SLOWDOWN = [3.6, 2.6, 1.9, 1.4];
const ROW_DELAY = 220;
const TILE_DELAY = 30;
/** Rows below this one (out of view until scrolled to) turn together with it. */
export const LAST_ROLLING_ROW = 7;

const flapDuration = (remaining: number) => FLAP_MS * (remaining < SLOWDOWN.length ? SLOWDOWN[remaining] : 1);

/** The board text of a title: upper case, at least `width` tiles. A longer title scrolls instead of being cut. */
export const boardText = (title: string, width = BOARD_WIDTH) => title.toUpperCase().padEnd(width, " ");

export interface Tile {
  char: string;
  /** Turning right now: "a" and "b" alternate, so each flap restarts its animation. */
  turning: "a" | "b" | null;
}

const tileStart = (row: number, column: number) => Math.min(row, LAST_ROLLING_ROW) * ROW_DELAY + column * TILE_DELAY;

/** When the tile at this row and column has reached its character. */
export function tileEnd(char: string, row: number, column: number): number {
  const target = Math.max(0, FLAP_ORDER.indexOf(char));
  let end = tileStart(row, column);
  for (let k = 0; k < target; k++) end += flapDuration(target - k - 1);
  return end;
}

/** The tile `time` ms after the board started rolling; `time` null means the board has settled. */
export function tileAt(char: string, row: number, column: number, time: number | null): Tile {
  const known = FLAP_ORDER.indexOf(char);
  if (time === null) return { char, turning: null };
  const start = tileStart(row, column);
  const target = Math.max(0, known);
  let step = 0;
  let at = start;
  let changedAt = -Infinity;
  while (step < target && at + flapDuration(target - step - 1) <= time) {
    at += flapDuration(target - step - 1);
    step += 1;
    changedAt = at;
  }
  const shown = known === -1 ? (time >= start ? char : " ") : FLAP_ORDER[step];
  return { char: shown, turning: time - changedAt < FLAP_MS ? (step % 2 ? "b" : "a") : null };
}

/** The tiles of one text on the board, starting at `column`. */
export const tilesAt = (text: string, row: number, column: number, time: number | null) =>
  Array.from(text).map((char, j) => tileAt(char, row, column + j, time));

/** The columns where the board's three texts start: time, date, title. */
export const COLUMNS = { time: 0, date: 5, title: 10 } as const;

/** When the last tile of these rows has settled, plus a short pause. */
export function rollDuration(rows: { time: string; date: string; title: string }[]): number {
  let last = 0;
  rows.forEach((row, i) => {
    for (const [key, column] of Object.entries(COLUMNS) as [keyof typeof COLUMNS, number][]) {
      Array.from(row[key]).forEach((char, j) => {
        last = Math.max(last, tileEnd(char, i, column + j));
      });
    }
  });
  return last + 120;
}
