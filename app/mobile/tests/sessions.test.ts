import { describe, expect, test } from "bun:test";
import {
  streakOf,
  targetSession,
  trainedDays,
  weekDaysTrained,
} from "../src/lib/sessions";
import { aCheckin, aSession } from "./fixtures";

const NOON = new Date(2026, 7, 24, 12, 0, 0);

describe("targetSession", () => {
  test("prefers a session today that the member already checked into", () => {
    const morning = aSession({ sessionDate: "2026-08-24", time: "06:00:00" });
    const evening = aSession({ sessionDate: "2026-08-24", time: "18:00:00" });
    const checkin = aCheckin({ workoutSessionId: evening.id });

    expect(targetSession([morning, evening], [checkin], NOON)).toBe(evening);
  });

  test("ignores an undone check-in and falls through to the next session", () => {
    const evening = aSession({ sessionDate: "2026-08-24", time: "18:00:00" });
    const checkin = aCheckin({
      workoutSessionId: evening.id,
      undone: true,
    });

    expect(targetSession([evening], [checkin], NOON)).toBe(evening);
  });

  test("falls back to the next upcoming session when nothing is checked into", () => {
    const past = aSession({ sessionDate: "2026-08-24", time: "06:00:00" });
    const upcoming = aSession({ sessionDate: "2026-08-24", time: "18:00:00" });

    expect(targetSession([past, upcoming], [], NOON)).toBe(upcoming);
  });

  test("is undefined when there is nothing today and nothing ahead", () => {
    const past = aSession({ sessionDate: "2026-08-24", time: "06:00:00" });
    expect(targetSession([past], [], NOON)).toBeUndefined();
  });

  test("is undefined for an empty schedule", () => {
    expect(targetSession([], [], NOON)).toBeUndefined();
  });
});

describe("trainedDays", () => {
  test("collects the distinct days a member actually trained", () => {
    const monday = aSession({ sessionDate: "2026-08-24" });
    const tuesday = aSession({ sessionDate: "2026-08-25" });
    const days = trainedDays(
      [
        aCheckin({ workoutSessionId: monday.id }),
        aCheckin({ workoutSessionId: tuesday.id }),
      ],
      [monday, tuesday],
    );
    expect(days).toEqual(new Set(["2026-08-24", "2026-08-25"]));
  });

  test("counts two check-ins on one day once", () => {
    const monday = aSession({ sessionDate: "2026-08-24" });
    const days = trainedDays(
      [
        aCheckin({ workoutSessionId: monday.id }),
        aCheckin({ workoutSessionId: monday.id }),
      ],
      [monday],
    );
    expect(days.size).toBe(1);
  });

  test("ignores undone check-ins", () => {
    const monday = aSession({ sessionDate: "2026-08-24" });
    expect(
      trainedDays(
        [aCheckin({ workoutSessionId: monday.id, undone: true })],
        [monday],
      ).size,
    ).toBe(0);
  });

  test("ignores a check-in whose session is unknown", () => {
    expect(trainedDays([aCheckin({ workoutSessionId: "gone" })], []).size).toBe(
      0,
    );
  });
});

describe("weekDaysTrained", () => {
  test("returns Monday through Sunday, flagging the trained days", () => {
    const week = weekDaysTrained(new Set(["2026-08-24"]), NOON);
    expect(week).toHaveLength(7);
    expect(week[0]?.trained).toBe(true);
    expect(week.slice(1).every((day) => !day.trained)).toBe(true);
  });

  test("flags nothing for an empty set", () => {
    expect(
      weekDaysTrained(new Set(), NOON).every((day) => !day.trained),
    ).toBe(true);
  });
});

describe("streakOf", () => {
  test("counts consecutive days ending today", () => {
    const days = new Set(["2026-08-24", "2026-08-23", "2026-08-22"]);
    expect(streakOf(days, NOON)).toBe(3);
  });

  test("still counts a streak that ended yesterday", () => {
    const days = new Set(["2026-08-23", "2026-08-22"]);
    expect(streakOf(days, NOON)).toBe(2);
  });

  test("is zero when the last training was two days ago", () => {
    expect(streakOf(new Set(["2026-08-22"]), NOON)).toBe(0);
  });

  test("is zero with no trained days", () => {
    expect(streakOf(new Set(), NOON)).toBe(0);
  });

  test("stops at the first gap", () => {
    const days = new Set(["2026-08-24", "2026-08-23", "2026-08-21"]);
    expect(streakOf(days, NOON)).toBe(2);
  });

  test("counts a streak that runs back across a month boundary", () => {
    const days = new Set(["2026-09-01", "2026-08-31", "2026-08-30"]);
    expect(streakOf(days, new Date(2026, 8, 1, 12))).toBe(3);
  });
})
