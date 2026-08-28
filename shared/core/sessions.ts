import { addDays, isoDate } from "./week";
import type { Checkin, WorkoutSessionWithStats } from "./types";

export const CHECKIN_WINDOW_HOURS = 12;

export const DEFAULT_CAPACITY = 20;

const HISTORY_DAYS = 90;

export const historyStart = (now = new Date()) =>
  isoDate(addDays(now, -HISTORY_DAYS));

const CHECKIN_WINDOW_MS = CHECKIN_WINDOW_HOURS * 60 * 60 * 1000;

export const dayKey = (session: WorkoutSessionWithStats) =>
  session.sessionDate.slice(0, 10);

export const dayDate = (day: string) => new Date(`${day}T12:00:00`);

export const startsAt = (session: WorkoutSessionWithStats) =>
  new Date(`${dayKey(session)}T${session.time.slice(0, 5)}:00`);

export const opensAt = (session: WorkoutSessionWithStats) =>
  new Date(startsAt(session).getTime() - CHECKIN_WINDOW_MS);

export const checkinState = (
  session: WorkoutSessionWithStats,
  now = new Date(),
) => {
  if (now >= startsAt(session)) return "closed";
  if (now < opensAt(session)) return "early";
  return "open";
};

export const isFull = (session: WorkoutSessionWithStats) =>
  session.occupied >= session.capacity;

export const sessionsOn = (sessions: WorkoutSessionWithStats[], day: string) =>
  sessions
    .filter((session) => dayKey(session) === day)
    .sort((a, b) => a.time.localeCompare(b.time));

export const nextSession = (
  sessions: WorkoutSessionWithStats[],
  now = new Date(),
) => {
  let earliest: WorkoutSessionWithStats | undefined;
  let earliestAt = Infinity;

  for (const session of sessions) {
    const at = startsAt(session).getTime();
    if (at > now.getTime() && at < earliestAt) {
      earliest = session;
      earliestAt = at;
    }
  }

  return earliest;
};

export const dayBySession = (sessions: WorkoutSessionWithStats[]) =>
  new Map(sessions.map((session) => [session.id, dayKey(session)]));

export const daysWithSessions = (sessions: WorkoutSessionWithStats[]) =>
  new Set(sessions.map(dayKey));

export const checkinDay = (
  checkin: Checkin,
  days: Map<string, string>,
) => days.get(checkin.workoutSessionId);
