import { describe, expect, test } from "bun:test";
import { countdown, monthAndYear, relativeTime } from "../src/lib/format";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const AT = new Date(2026, 7, 24, 12, 0, 0);
const iso = AT.toISOString();

describe("monthAndYear", () => {
  test("abbreviates the month and appends the year", () => {
    expect(monthAndYear(new Date(2026, 7, 24).toISOString())).toBe("ago/2026");
  });

  test("handles January and December", () => {
    expect(monthAndYear(new Date(2026, 0, 15).toISOString())).toBe("jan/2026");
    expect(monthAndYear(new Date(2026, 11, 15).toISOString())).toBe("dez/2026");
  });
});

describe("relativeTime", () => {
  test("rounds anything under an hour to minutes", () => {
    expect(relativeTime(iso, AT.getTime() + 5 * MINUTE)).toBe("há 5 min");
  });

  test("never reports zero minutes", () => {
    expect(relativeTime(iso, AT.getTime())).toBe("há 1 min");
    expect(relativeTime(iso, AT.getTime() + 1000)).toBe("há 1 min");
  });

  test("clamps a future timestamp to the present", () => {
    expect(relativeTime(iso, AT.getTime() - 5 * MINUTE)).toBe("há 1 min");
  });

  test("switches to hours, singular at one", () => {
    expect(relativeTime(iso, AT.getTime() + HOUR)).toBe("há 1 hora");
    expect(relativeTime(iso, AT.getTime() + 3 * HOUR)).toBe("há 3 horas");
  });

  test("switches to days, singular at one", () => {
    expect(relativeTime(iso, AT.getTime() + DAY)).toBe("há 1 dia");
    expect(relativeTime(iso, AT.getTime() + 5 * DAY)).toBe("há 5 dias");
  });
});

describe("countdown", () => {
  test("says agora once the target has arrived or passed", () => {
    expect(countdown(AT, AT)).toBe("agora");
    expect(countdown(AT, new Date(AT.getTime() + MINUTE))).toBe("agora");
  });

  test("counts minutes under an hour, never zero", () => {
    expect(countdown(new Date(AT.getTime() + 30 * MINUTE), AT)).toBe("30 min");
    expect(countdown(new Date(AT.getTime() + 1000), AT)).toBe("1 min");
  });

  test("counts hours under a day", () => {
    expect(countdown(new Date(AT.getTime() + 5 * HOUR), AT)).toBe("5h");
  });

  test("counts days beyond that", () => {
    expect(countdown(new Date(AT.getTime() + 3 * DAY), AT)).toBe("3d");
  });
});
