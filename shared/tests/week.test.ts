import { describe, expect, test } from "bun:test";
import {
  addDays,
  isoDate,
  shortDate,
  startOfWeek,
  summarize,
  WEEK_DAY_INITIAL,
  WEEK_DAY_LABEL,
  WEEK_DAYS,
  weekDates,
  weekDayOf,
} from "../index";

describe("isoDate", () => {
  test("formats a local date as YYYY-MM-DD", () => {
    expect(isoDate(new Date(2026, 7, 24))).toBe("2026-08-24");
  });

  test("pads single digit months and days", () => {
    expect(isoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  test("reads local wall time, not UTC", () => {
    expect(isoDate(new Date(2026, 7, 24, 23, 30))).toBe("2026-08-24");
    expect(isoDate(new Date(2026, 7, 24, 0, 30))).toBe("2026-08-24");
  });
});

describe("addDays", () => {
  test("moves forward", () => {
    expect(isoDate(addDays(new Date(2026, 7, 24), 3))).toBe("2026-08-27");
  });

  test("moves backward", () => {
    expect(isoDate(addDays(new Date(2026, 7, 24), -3))).toBe("2026-08-21");
  });

  test("rolls over a month boundary", () => {
    expect(isoDate(addDays(new Date(2026, 7, 31), 1))).toBe("2026-09-01");
  });

  test("rolls over a year boundary", () => {
    expect(isoDate(addDays(new Date(2026, 11, 31), 1))).toBe("2027-01-01");
  });

  test("handles a leap day", () => {
    expect(isoDate(addDays(new Date(2028, 1, 28), 1))).toBe("2028-02-29");
  });

  test("advances exactly one calendar day across a DST transition", () => {
    expect(isoDate(addDays(new Date(2026, 2, 7), 1))).toBe("2026-03-08");
    expect(isoDate(addDays(new Date(2026, 9, 31), 1))).toBe("2026-11-01");
  });

  test("does not mutate its argument", () => {
    const original = new Date(2026, 7, 24);
    addDays(original, 5);
    expect(isoDate(original)).toBe("2026-08-24");
  });
});

describe("startOfWeek", () => {
  test("a Monday is its own week start", () => {
    expect(isoDate(startOfWeek(new Date(2026, 7, 24)))).toBe("2026-08-24");
  });

  test("a Sunday belongs to the week that began six days earlier", () => {
    expect(isoDate(startOfWeek(new Date(2026, 7, 23)))).toBe("2026-08-17");
  });

  test("zeroes the time", () => {
    const monday = startOfWeek(new Date(2026, 7, 26, 18, 45, 30, 500));
    expect(monday.getHours()).toBe(0);
    expect(monday.getMinutes()).toBe(0);
    expect(monday.getSeconds()).toBe(0);
    expect(monday.getMilliseconds()).toBe(0);
  });

  test("does not mutate its argument", () => {
    const original = new Date(2026, 7, 26);
    startOfWeek(original);
    expect(isoDate(original)).toBe("2026-08-26");
  });
});

describe("weekDates", () => {
  test("returns Monday through Sunday", () => {
    const dates = weekDates(startOfWeek(new Date(2026, 7, 24)));
    expect(dates).toHaveLength(7);
    expect(dates.map(isoDate)).toEqual([
      "2026-08-24",
      "2026-08-25",
      "2026-08-26",
      "2026-08-27",
      "2026-08-28",
      "2026-08-29",
      "2026-08-30",
    ]);
  });

  test("spans a month boundary", () => {
    expect(weekDates(startOfWeek(new Date(2026, 7, 31))).map(isoDate)).toEqual([
      "2026-08-31",
      "2026-09-01",
      "2026-09-02",
      "2026-09-03",
      "2026-09-04",
      "2026-09-05",
      "2026-09-06",
    ]);
  });
});

describe("weekDayOf", () => {
  test("maps Monday to the first entry of WEEK_DAYS", () => {
    expect(weekDayOf(new Date(2026, 7, 24))).toBe("monday");
  });

  test("maps Sunday to the last entry, not the first", () => {
    expect(weekDayOf(new Date(2026, 7, 23))).toBe("sunday");
  });

  test("covers a whole week in order", () => {
    const monday = startOfWeek(new Date(2026, 7, 24));
    expect(weekDates(monday).map(weekDayOf)).toEqual([...WEEK_DAYS]);
  });
});

describe("week day labels", () => {
  test("every week day has a label and an initial", () => {
    for (const day of WEEK_DAYS) {
      expect(WEEK_DAY_LABEL[day]).toBeTruthy();
      expect(WEEK_DAY_INITIAL[day]).toBeTruthy();
    }
  });
});

describe("shortDate", () => {
  test("reformats an ISO day as DD/MM/YYYY", () => {
    expect(shortDate("2026-08-24")).toBe("24/08/2026");
  });

  test("ignores the time part of a timestamp", () => {
    expect(shortDate("2026-08-24T23:59:59.999Z")).toBe("24/08/2026");
  });
});

describe("summarize", () => {
  test("joins the first two non-empty lines", () => {
    expect(summarize("Fran\n21-15-9\nThrusters")).toBe("Fran · 21-15-9");
  });

  test("drops blank and whitespace-only lines", () => {
    expect(summarize("Fran\n\n   \n21-15-9")).toBe("Fran · 21-15-9");
  });

  test("trims each line", () => {
    expect(summarize("  Fran  \n  21-15-9  ")).toBe("Fran · 21-15-9");
  });

  test("honours a custom line count", () => {
    expect(summarize("a\nb\nc\nd", 3)).toBe("a · b · c");
  });

  test("returns an empty string for blank input", () => {
    expect(summarize("\n\n   ")).toBe("");
  });
});
