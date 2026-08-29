import { describe, expect, test } from "bun:test";
import {
  clockLabel,
  dayAndMonth,
  dayHeading,
  fullName,
  hourLabel,
  initials,
  longDate,
  monthHeading,
  monthShort,
  weekDayLong,
} from "../index";

describe("weekDayLong", () => {
  test("names a Monday", () => {
    expect(weekDayLong(new Date(2026, 7, 24))).toBe("Segunda");
  });

  test("names a Sunday", () => {
    expect(weekDayLong(new Date(2026, 7, 23))).toBe("Domingo");
  });

  test("names a Saturday", () => {
    expect(weekDayLong(new Date(2026, 7, 29))).toBe("Sábado");
  });
});

describe("monthShort", () => {
  test("abbreviates a month in pt-BR", () => {
    expect(monthShort(new Date(2026, 7, 24))).toBe("ago");
  });

  test("covers January and December", () => {
    expect(monthShort(new Date(2026, 0, 1))).toBe("jan");
    expect(monthShort(new Date(2026, 11, 1))).toBe("dez");
  });
});

describe("dayAndMonth", () => {
  test("joins the day number and the short month", () => {
    expect(dayAndMonth(new Date(2026, 7, 24))).toBe("24 ago");
  });

  test("does not pad the day", () => {
    expect(dayAndMonth(new Date(2026, 7, 4))).toBe("4 ago");
  });
});

describe("dayHeading", () => {
  test("joins the long week day and the day and month", () => {
    expect(dayHeading(new Date(2026, 7, 24))).toBe("Segunda · 24 ago");
  });
});

describe("longDate", () => {
  test("spells the month in lowercase", () => {
    expect(longDate(new Date(2026, 7, 24))).toBe("Segunda, 24 de agosto");
  });

  test("lowercases an accented month", () => {
    expect(longDate(new Date(2026, 2, 2))).toBe("Segunda, 2 de março");
  });
});

describe("monthHeading", () => {
  test("names the month and year", () => {
    expect(monthHeading(new Date(2026, 7, 24))).toBe("Agosto 2026");
  });
});

describe("hourLabel", () => {
  test("trims the seconds Postgres returns", () => {
    expect(hourLabel("06:00:00")).toBe("06:00");
  });

  test("leaves a plain HH:MM untouched", () => {
    expect(hourLabel("06:00")).toBe("06:00");
  });
});

describe("initials", () => {
  test("takes the first letter of each name, uppercased", () => {
    expect(initials("ana", "silva")).toBe("AS");
  });

  test("survives an empty last name", () => {
    expect(initials("Ana", "")).toBe("A");
  });

  test("survives two empty names", () => {
    expect(initials("", "")).toBe("");
  });
});

describe("fullName", () => {
  test("joins first and last name", () => {
    expect(fullName("Ana", "Silva")).toBe("Ana Silva");
  });
});

describe("clockLabel", () => {
  test("pads hours and minutes", () => {
    expect(clockLabel(new Date(2026, 7, 24, 6, 5))).toBe("06:05");
  });

  test("formats a late evening time", () => {
    expect(clockLabel(new Date(2026, 7, 24, 19, 30))).toBe("19:30");
  });

  test("formats midnight", () => {
    expect(clockLabel(new Date(2026, 7, 24, 0, 0))).toBe("00:00");
  });
});
