import { describe, expect, test } from "bun:test";
import {
  CHECKIN_WINDOW_HOURS,
  DEFAULT_CAPACITY,
  checkinDay,
  checkinState,
  dayBySession,
  dayDate,
  dayKey,
  daysWithSessions,
  historyStart,
  isFull,
  nextSession,
  opensAt,
  sessionsOn,
  startsAt,
} from "../index";
import { aCheckin, aSession } from "./fixtures";

const WINDOW_MS = CHECKIN_WINDOW_HOURS * 60 * 60 * 1000;

describe("dayKey", () => {
  test("takes the day from an ISO timestamp", () => {
    expect(dayKey(aSession({ sessionDate: "2026-08-24T00:00:00.000Z" }))).toBe(
      "2026-08-24",
    );
  });

  test("is a string slice, so the day never depends on the runtime timezone", () => {
    expect(dayKey(aSession({ sessionDate: "2026-08-24T00:00:00.000Z" }))).toBe(
      "2026-08-24",
    );
    expect(dayKey(aSession({ sessionDate: "2026-08-24T23:59:59.999Z" }))).toBe(
      "2026-08-24",
    );
  });

  test("accepts a bare date with no time part", () => {
    expect(dayKey(aSession({ sessionDate: "2026-08-24" }))).toBe("2026-08-24");
  });
});

describe("dayDate", () => {
  test("parses to local noon so the calendar day survives any offset", () => {
    const date = dayDate("2026-08-24");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(24);
    expect(date.getHours()).toBe(12);
  });

  test("round-trips every day of a month without drifting", () => {
    for (let day = 1; day <= 31; day++) {
      const key = `2026-03-${String(day).padStart(2, "0")}`;
      expect(dayDate(key).getDate()).toBe(day);
    }
  });
});

describe("startsAt", () => {
  test("combines the session day with its time", () => {
    const at = startsAt(aSession({ time: "06:00:00" }));
    expect(at.getHours()).toBe(6);
    expect(at.getMinutes()).toBe(0);
    expect(at.getDate()).toBe(24);
  });

  test("tolerates the HH:MM:SS Postgres returns and plain HH:MM alike", () => {
    expect(startsAt(aSession({ time: "18:30:00" })).getTime()).toBe(
      startsAt(aSession({ time: "18:30" })).getTime(),
    );
  });
});

describe("opensAt", () => {
  test("opens CHECKIN_WINDOW_HOURS before the session starts", () => {
    const session = aSession();
    expect(startsAt(session).getTime() - opensAt(session).getTime()).toBe(
      WINDOW_MS,
    );
  });
});

describe("checkinState", () => {
  const session = aSession({ time: "06:00:00" });
  const start = startsAt(session);
  const open = opensAt(session);

  test("is early before the window opens", () => {
    expect(checkinState(session, new Date(open.getTime() - 1))).toBe("early");
  });

  test("is open exactly when the window opens", () => {
    expect(checkinState(session, open)).toBe("open");
  });

  test("is open one millisecond before the session starts", () => {
    expect(checkinState(session, new Date(start.getTime() - 1))).toBe("open");
  });

  test("is closed exactly at the start time", () => {
    expect(checkinState(session, start)).toBe("closed");
  });

  test("is closed after the session has started", () => {
    expect(checkinState(session, new Date(start.getTime() + 1))).toBe("closed");
  });
});

describe("isFull", () => {
  test("is false with seats left", () => {
    expect(isFull(aSession({ capacity: 20, occupied: 19 }))).toBe(false);
  });

  test("is true at capacity", () => {
    expect(isFull(aSession({ capacity: 20, occupied: 20 }))).toBe(true);
  });

  test("is true past capacity", () => {
    expect(isFull(aSession({ capacity: 20, occupied: 21 }))).toBe(true);
  });

  test("DEFAULT_CAPACITY matches the schedule default", () => {
    expect(DEFAULT_CAPACITY).toBe(20);
  });
});

describe("sessionsOn", () => {
  test("returns only that day, sorted by time", () => {
    const late = aSession({ sessionDate: "2026-08-24", time: "18:00:00" });
    const early = aSession({ sessionDate: "2026-08-24", time: "06:00:00" });
    const other = aSession({ sessionDate: "2026-08-25", time: "07:00:00" });
    expect(sessionsOn([late, early, other], "2026-08-24")).toEqual([
      early,
      late,
    ]);
  });

  test("is empty for a day with no sessions", () => {
    expect(sessionsOn([aSession()], "2030-01-01")).toEqual([]);
  });
});

describe("nextSession", () => {
  const session = aSession({ time: "06:00:00" });
  const start = startsAt(session);

  test("finds the earliest session still in the future", () => {
    const later = aSession({ sessionDate: "2026-08-25", time: "06:00:00" });
    expect(nextSession([later, session], new Date(start.getTime() - 1))).toBe(
      session,
    );
  });

  test("excludes a session starting exactly now", () => {
    expect(nextSession([session], start)).toBeUndefined();
  });

  test("returns undefined when every session has passed", () => {
    expect(nextSession([session], new Date(start.getTime() + 1))).toBeUndefined();
  });

  test("returns undefined for an empty list", () => {
    expect(nextSession([], start)).toBeUndefined();
  });
});

describe("dayBySession and checkinDay", () => {
  test("maps a check-in back to its session day", () => {
    const session = aSession({ sessionDate: "2026-08-24" });
    const days = dayBySession([session]);
    expect(days.get(session.id)).toBe("2026-08-24");
    expect(checkinDay(aCheckin({ workoutSessionId: session.id }), days)).toBe(
      "2026-08-24",
    );
  });

  test("a check-in for an unknown session has no day", () => {
    expect(checkinDay(aCheckin({ workoutSessionId: "gone" }), new Map())).toBeUndefined();
  });
});

describe("daysWithSessions", () => {
  test("collapses repeated days into a set", () => {
    const days = daysWithSessions([
      aSession({ sessionDate: "2026-08-24", time: "06:00:00" }),
      aSession({ sessionDate: "2026-08-24", time: "18:00:00" }),
      aSession({ sessionDate: "2026-08-25", time: "06:00:00" }),
    ]);
    expect(days).toEqual(new Set(["2026-08-24", "2026-08-25"]));
  });
});

describe("historyStart", () => {
  test("is 90 days before the given date", () => {
    expect(historyStart(new Date(2026, 7, 24))).toBe("2026-05-26");
  });

  test("crosses a year boundary", () => {
    expect(historyStart(new Date(2026, 0, 10))).toBe("2025-10-12");
  });
});
