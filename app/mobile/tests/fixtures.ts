import type { Checkin, WorkoutSessionWithStats } from "@eazybox/shared";

let sequence = 0;

export const aSession = (
  overrides: Partial<WorkoutSessionWithStats> = {},
): WorkoutSessionWithStats => ({
  id: `session-${++sequence}`,
  workoutScheduleId: "slot-1",
  workoutId: "workout-1",
  weekDay: "monday",
  time: "06:00:00",
  sessionDate: "2026-08-24",
  capacity: 20,
  coachId: null,
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  occupied: 0,
  coach: null,
  ...overrides,
});

export const aCheckin = (overrides: Partial<Checkin> = {}): Checkin => ({
  id: `checkin-${++sequence}`,
  userId: "user-1",
  workoutSessionId: "session-1",
  undone: false,
  createdAt: "2026-08-24T05:00:00.000Z",
  ...overrides,
});
