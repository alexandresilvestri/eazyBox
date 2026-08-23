import type { WorkoutSession } from "@eazybox/shared";

export const sessionsOn = (sessions: WorkoutSession[], date: string) =>
  sessions
    .filter((session) => session.sessionDate.slice(0, 10) === date)
    .sort((a, b) => a.time.localeCompare(b.time));
