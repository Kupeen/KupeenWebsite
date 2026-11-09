import { describe, expect, it } from "vitest";
import { boardDate, danishTime, dayText, departureText, longDate, monthKey, monthLabel, parseFacebookDate, timeText, weekdayCode } from "./dates";

describe("Danish dates", () => {
  // 20:00 in Denmark in winter (UTC+1)
  const concert = parseFacebookDate("2026-11-06T20:00:00+0100");

  it("reads Facebook's dates, whose offset has no colon", () => {
    expect(concert.toISOString()).toBe("2026-11-06T19:00:00.000Z");
  });

  it("writes the board's columns and the front page's next departure", () => {
    expect(timeText(concert)).toBe("20.00");
    expect(boardDate(concert)).toBe("06.11");
    expect(weekdayCode(concert)).toBe("FRE");
    expect(departureText(concert)).toBe("FRE 6/11 KL. 20.00");
  });

  it("writes long dates and months", () => {
    expect(longDate(concert)).toBe("fre. 6. november 2026");
    expect(dayText(concert)).toBe("6. november 2026");
    expect(monthKey(concert)).toBe("2026-11");
    expect(monthLabel(concert, "long")).toBe("NOVEMBER 2026");
    expect(monthLabel(concert, "short")).toBe("NOV 2026");
  });

  it("uses Danish time, also in summer and across midnight", () => {
    // 22:30 UTC on a Monday in July is 00:30 on Tuesday in Denmark (UTC+2)
    const late = new Date("2027-07-05T22:30:00Z");
    expect(danishTime(late)).toMatchObject({ day: 6, month: 7, hour: 0, minute: 30, weekday: 1 });
    expect(weekdayCode(late)).toBe("TIRS");
    expect(timeText(late)).toBe("00.30");
  });

  it("names every weekday the way the board does", () => {
    const monday = new Date("2026-11-09T12:00:00Z");
    const days = Array.from({ length: 7 }, (_, i) => weekdayCode(new Date(monday.getTime() + i * 86_400_000)));
    expect(days).toEqual(["MAN", "TIRS", "ONS", "TORS", "FRE", "LØR", "SØN"]);
  });
});
