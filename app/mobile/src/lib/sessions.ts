import {
  activeCheckin,
  dayBySession,
  isActive,
  isoDate,
  nextSession,
  sessionsOn,
  startOfWeek,
  weekDates,
  type Checkin,
  type WorkoutSessionWithStats,
} from "@eazybox/shared";

export const targetSession = (
  sessions: WorkoutSessionWithStats[],
  checkins: Checkin[],
  now = new Date(),
) =>
  sessionsOn(sessions, isoDate(now)).find((session) =>
    activeCheckin(checkins, session.id),
  ) ?? nextSession(sessions, now);

export const trainedDays = (
  checkins: Checkin[],
  sessions: WorkoutSessionWithStats[],
) => {
  const bySession = dayBySession(sessions);
  const days = new Set<string>();

  for (const checkin of checkins.filter(isActive)) {
    const day = bySession.get(checkin.workoutSessionId);
    if (day) days.add(day);
  }

  return days;
};

export const weekDaysTrained = (days: Set<string>, reference = new Date()) =>
  weekDates(startOfWeek(reference)).map((date) => ({
    date,
    trained: days.has(isoDate(date)),
  }));

export const streakOf = (days: Set<string>, reference = new Date()) => {
  const cursor = new Date(reference);
  cursor.setHours(0, 0, 0, 0);
  if (!days.has(isoDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (days.has(isoDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};
