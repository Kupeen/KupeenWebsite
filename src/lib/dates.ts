// Dates as the site shows them: always in Danish time (Europe/Copenhagen), whatever the visitor's own time zone.
// Weekdays and months come from fixed Danish lists, so the text does not depend on the browser's language data.

export { parseFacebookDate } from "../../netlify/lib/dates";

const TIME_ZONE = "Europe/Copenhagen";
const WEEKDAYS = ["MAN", "TIRS", "ONS", "TORS", "FRE", "LØR", "SØN"];
const MONTHS = ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"];
const ENGLISH_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const partsFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  weekday: "short",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
});

export interface DanishTime {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  /** 0 = Monday … 6 = Sunday */
  weekday: number;
}

/** The calendar date and clock time in Denmark at this moment. */
export function danishTime(date: Date): DanishTime {
  const parts: Record<string, string> = {};
  for (const part of partsFormat.formatToParts(date)) parts[part.type] = part.value;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: ENGLISH_WEEKDAYS.indexOf(parts.weekday),
  };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** »FRE«, »TIRS« … as on the departure board. */
export const weekdayCode = (date: Date) => WEEKDAYS[danishTime(date).weekday];

/** »20.00« */
export function timeText(date: Date): string {
  const t = danishTime(date);
  return `${pad2(t.hour)}.${pad2(t.minute)}`;
}

/** »06.11«, the date column of the board. */
export function boardDate(date: Date): string {
  const t = danishTime(date);
  return `${pad2(t.day)}.${pad2(t.month)}`;
}

/** »FRE 6/11 KL. 20.00«, the next departure on the front page. */
export function departureText(date: Date): string {
  const t = danishTime(date);
  return `${WEEKDAYS[t.weekday]} ${t.day}/${t.month} KL. ${timeText(date)}`;
}

/** »fre. 6. november 2026« */
export function longDate(date: Date): string {
  const t = danishTime(date);
  return `${WEEKDAYS[t.weekday].toLowerCase()}. ${t.day}. ${MONTHS[t.month - 1]} ${t.year}`;
}

/** »6. november 2026« */
export function dayText(date: Date): string {
  const t = danishTime(date);
  return `${t.day}. ${MONTHS[t.month - 1]} ${t.year}`;
}

/** »2026-11«: sorts and groups by month. */
export function monthKey(date: Date): string {
  const t = danishTime(date);
  return `${t.year}-${pad2(t.month)}`;
}

/** »NOVEMBER 2026« (style "long") or »NOV 2026« (style "short"). */
export function monthLabel(date: Date, style: "long" | "short"): string {
  const t = danishTime(date);
  const name = MONTHS[t.month - 1];
  return `${(style === "short" ? name.slice(0, 3) : name).toUpperCase()} ${t.year}`;
}
