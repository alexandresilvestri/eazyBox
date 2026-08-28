import {
  addDays,
  dayAndMonth,
  dayDate,
  dayKey,
  daysWithSessions,
  hourLabel,
  isActive,
  isoDate,
  WEEK_DAY_LABEL,
  WEEK_DAYS,
  weekDayOf,
} from '@eazybox/shared'
import type { Checkin, User, WorkoutSessionWithStats } from '@eazybox/shared'

export const liveCheckins = (checkins: Checkin[]) => checkins.filter(isActive)

export const capacityOf = (slots: { capacity: number }[]) =>
  slots.reduce((total, slot) => total + slot.capacity, 0)

export const occupiedOf = (sessions: WorkoutSessionWithStats[]) =>
  sessions.reduce((total, session) => total + session.occupied, 0)

export const occupancyRate = (sessions: WorkoutSessionWithStats[]) => {
  const capacity = capacityOf(sessions)
  return capacity === 0 ? 0 : occupiedOf(sessions) / capacity
}

export const dayRange = (from: Date, days: number) =>
  Array.from({ length: days }, (_, index) => isoDate(addDays(from, index)))

export const byId = <T extends { id: string }>(rows: T[]) =>
  new Map(rows.map((row) => [row.id, row]))

export const checkinsInDays = (
  checkins: Checkin[],
  days: Map<string, string>,
  window: string[]
) => {
  const wanted = new Set(window)
  return liveCheckins(checkins).filter((checkin) => {
    const day = days.get(checkin.workoutSessionId)
    return day !== undefined && wanted.has(day)
  })
}

export const byTimeSlot = (
  sessions: WorkoutSessionWithStats[],
  window: string[]
) => {
  const wanted = new Set(window)
  const totals = new Map<string, number>()

  for (const session of sessions) {
    if (!wanted.has(dayKey(session))) continue
    const time = hourLabel(session.time)
    totals.set(time, (totals.get(time) ?? 0) + session.occupied)
  }

  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, value]) => ({ label: time.slice(0, 2), value }))
}

export const byWeekday = (checkins: Checkin[], days: Map<string, string>) => {
  const totals = new Map<string, number>()

  for (const checkin of checkins) {
    const day = days.get(checkin.workoutSessionId)
    if (!day) continue
    const weekDay = weekDayOf(dayDate(day))
    totals.set(weekDay, (totals.get(weekDay) ?? 0) + 1)
  }

  return WEEK_DAYS.map((weekDay) => ({
    label: WEEK_DAY_LABEL[weekDay],
    value: totals.get(weekDay) ?? 0,
  }))
}

export const trainingDays = (
  sessions: WorkoutSessionWithStats[],
  window: string[]
) => {
  const withSessions = daysWithSessions(sessions)
  return window.filter((day) => withSessions.has(day))
}

export const perMember = (
  checkins: Checkin[],
  users: User[],
  days: Map<string, string>,
  available: string[]
) => {
  const daysByUser = new Map<string, Set<string>>()

  for (const checkin of checkins) {
    const day = days.get(checkin.workoutSessionId)
    if (!day) continue
    const seen = daysByUser.get(checkin.userId) ?? new Set<string>()
    seen.add(day)
    daysByUser.set(checkin.userId, seen)
  }

  return users
    .filter((user) => user.isActive)
    .map((user) => {
      const attended = daysByUser.get(user.id)?.size ?? 0
      return {
        user,
        attended,
        missed: Math.max(0, available.length - attended),
        rate: available.length === 0 ? 0 : attended / available.length,
      }
    })
    .sort((a, b) => b.attended - a.attended)
}

export const undoneInDays = (
  checkins: Checkin[],
  days: Map<string, string>,
  window: string[]
) => {
  const wanted = new Set(window)
  return checkins.filter((checkin) => {
    const day = days.get(checkin.workoutSessionId)
    return checkin.undone && day !== undefined && wanted.has(day)
  }).length
}

export const lastUsedByWorkout = (sessions: WorkoutSessionWithStats[]) => {
  const latest = new Map<string, string>()
  for (const session of sessions) {
    const day = dayKey(session)
    const known = latest.get(session.workoutId)
    if (!known || day > known) latest.set(session.workoutId, day)
  }
  return latest
}

export const dayLabel = (
  day: string | undefined,
  today: string,
  fallback: string
) => {
  if (!day) return fallback
  return day === today ? 'Hoje' : dayAndMonth(dayDate(day))
}

export const toCsv = (head: string[], rows: (string | number)[][]) =>
  [head, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell)
          return /[",;\n]/.test(value)
            ? `"${value.replace(/"/g, '""')}"`
            : value
        })
        .join(';')
    )
    .join('\n')
