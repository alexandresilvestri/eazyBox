import { dayDate, weekDayOf } from '@eazybox/shared'
import type { WorkoutSchedule, WorkoutSessionWithStats } from '@eazybox/shared'
import { apiFetch } from './api'

export const slotsToPublish = (
  schedule: WorkoutSchedule[],
  daySessions: WorkoutSessionWithStats[],
  day: string
) => {
  const published = new Set(
    daySessions.map((session) => session.workoutScheduleId)
  )
  const weekDay = weekDayOf(dayDate(day))
  return schedule.filter(
    (slot) => slot.weekDay === weekDay && !published.has(slot.id)
  )
}

export const publishDay = async (
  slots: WorkoutSchedule[],
  day: string,
  workoutId: string
) => {
  const results = await Promise.allSettled(
    slots.map((slot) =>
      apiFetch('/workout-sessions', {
        method: 'POST',
        body: JSON.stringify({
          workoutScheduleId: slot.id,
          workoutId,
          sessionDate: day,
        }),
      })
    )
  )
  return results.filter((result) => result.status === 'rejected').length
}
