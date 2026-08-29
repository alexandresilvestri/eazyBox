import { describe, expect, test } from "bun:test";
import { activeCheckin, countBySession, isActive } from "../index";
import { aCheckin } from "./fixtures";

describe("isActive", () => {
  test("a live check-in is active", () => {
    expect(isActive(aCheckin())).toBe(true);
  });

  test("an undone check-in is not", () => {
    expect(isActive(aCheckin({ undone: true }))).toBe(false);
  });
});

describe("countBySession", () => {
  test("counts live check-ins per session", () => {
    const counts = countBySession([
      aCheckin({ workoutSessionId: "a" }),
      aCheckin({ workoutSessionId: "a" }),
      aCheckin({ workoutSessionId: "b" }),
    ]);
    expect(counts.get("a")).toBe(2);
    expect(counts.get("b")).toBe(1);
  });

  test("ignores undone check-ins", () => {
    const counts = countBySession([
      aCheckin({ workoutSessionId: "a" }),
      aCheckin({ workoutSessionId: "a", undone: true }),
    ]);
    expect(counts.get("a")).toBe(1);
  });

  test("a session with only undone check-ins is absent, not zero", () => {
    const counts = countBySession([
      aCheckin({ workoutSessionId: "a", undone: true }),
    ]);
    expect(counts.has("a")).toBe(false);
    expect(counts.get("a")).toBeUndefined();
  });

  test("an empty list yields an empty map", () => {
    expect(countBySession([]).size).toBe(0);
  });
});

describe("activeCheckin", () => {
  test("finds the live check-in for a session", () => {
    const live = aCheckin({ workoutSessionId: "a" });
    expect(activeCheckin([live], "a")).toBe(live);
  });

  test("skips an undone check-in and finds the later live one", () => {
    const undone = aCheckin({ workoutSessionId: "a", undone: true });
    const live = aCheckin({ workoutSessionId: "a" });
    expect(activeCheckin([undone, live], "a")).toBe(live);
  });

  test("returns undefined when every check-in is undone", () => {
    const undone = aCheckin({ workoutSessionId: "a", undone: true });
    expect(activeCheckin([undone], "a")).toBeUndefined();
  });

  test("returns undefined for an unknown session", () => {
    expect(activeCheckin([aCheckin({ workoutSessionId: "a" })], "b")).toBeUndefined();
  });
});
