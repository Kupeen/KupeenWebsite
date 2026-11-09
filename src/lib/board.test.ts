import { describe, expect, it } from "vitest";
import type { FacebookEvent } from "../../netlify/lib/types";
import { boardText, BOARD_WIDTH, FLAP_ORDER, groupByMonth, rollDuration, tileAt, tileEnd, tilesAt, upcomingDepartures } from "./board";

const event = (id: string, start: string, extra: Partial<FacebookEvent> = {}): FacebookEvent => ({ id, name: `Event ${id}`, start_time: start, ...extra });

describe("the departures", () => {
  const events = [
    event("2", "2026-12-02T19:00:00+0100"),
    event("1", "2026-11-10T20:00:00+0100", { end_time: "2026-11-10T22:00:00+0100", ticket_uri: "javascript:alert(1)" }),
    event("3", "2026-11-09T17:00:00+0100", { cover: { source: "/api/image/event/3", offset_x: 50, offset_y: 10 } }),
  ];

  it("shows what is not over yet, soonest first; without an end time an event lasts three hours", () => {
    const now = new Date("2026-11-09T18:30:00Z"); // 19:30 in Denmark: event 3 started at 17:00 and runs until 20:00
    expect(upcomingDepartures(events, now).map((d) => d.id)).toEqual(["3", "1", "2"]);
    const later = new Date("2026-11-09T19:01:00Z");
    expect(upcomingDepartures(events, later).map((d) => d.id)).toEqual(["1", "2"]);
  });

  it("keeps only web addresses for tickets and turns the cover offsets into a position", () => {
    const [three, one] = upcomingDepartures(events, new Date("2026-11-01T00:00:00Z"));
    expect(one.ticketUrl).toBeNull();
    expect(three.image).toBe("/api/image/event/3");
    expect(three.imagePosition).toBe("50% 10%");
    expect(one.facebookUrl).toBe("https://www.facebook.com/events/1");
  });

  it("groups the departures by month", () => {
    const months = groupByMonth(upcomingDepartures(events, new Date("2026-11-01T00:00:00Z")));
    expect(months.map((m) => [m.key, m.label, m.tab, m.departures.length])).toEqual([
      ["2026-11", "NOVEMBER 2026", "NOV 2026", 2],
      ["2026-12", "DECEMBER 2026", "DEC 2026", 1],
    ]);
  });
});

describe("the split-flap tiles", () => {
  it("pads short titles to the board's width and keeps long ones whole", () => {
    expect(boardText("Lucia")).toHaveLength(BOARD_WIDTH);
    expect(boardText("Grooves & Gæster: Ulrich Lauridsen")).toBe("GROOVES & GÆSTER: ULRICH LAURIDSEN");
  });

  it("leafs through the flaps and ends on the character", () => {
    expect(tileAt("C", 0, 0, 0).char).toBe(" ");
    const end = tileEnd("C", 0, 0);
    expect(tileAt("C", 0, 0, end).char).toBe("C");
    expect(tileAt("C", 0, 0, end + 1000)).toEqual({ char: "C", turning: null });
    expect(tileAt("C", 0, 0, null)).toEqual({ char: "C", turning: null });
    // halfway, the tile shows a flap before C
    expect(FLAP_ORDER.indexOf(tileAt("C", 0, 0, end / 2).char)).toBeLessThan(FLAP_ORDER.indexOf("C"));
  });

  it("shows characters without a flap once their tile starts", () => {
    expect(tilesAt("(Æ)", 0, 0, 0).map((t) => t.char)).toEqual(["(", " ", " "]);
    expect(tilesAt("(Æ)", 0, 0, null).map((t) => t.char).join("")).toBe("(Æ)");
  });

  it("knows when the whole board has settled", () => {
    const rows = [{ time: "20.00", date: "06.11", title: boardText("Dine Isaksen") }];
    const done = rollDuration(rows);
    const settled = (time: number) => tilesAt(rows[0].title, 0, 10, time).map((t) => t.char).join("");
    expect(settled(done)).toBe(rows[0].title);
    expect(settled(0)).not.toBe(rows[0].title);
  });
});
