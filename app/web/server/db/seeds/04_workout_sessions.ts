import type { Knex } from 'knex'
import type { WeekDay } from '@eazybox/shared'

const WEEK_OFFSETS = [-2, -1, 0, 1]

const DAY_INDEX: Record<WeekDay, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
}

const mondayOfCurrentWeek = () => {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  monday.setHours(12, 0, 0, 0)
  return monday
}

const addDays = (date: Date, days: number) => {
  const shifted = new Date(date)
  shifted.setDate(date.getDate() + days)
  return shifted
}

const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export async function seed(knex: Knex) {
  const slots: {
    id: string
    weekDay: WeekDay
    time: string
    capacity: number
    coachId: string | null
  }[] = await knex('workout_schedule').select(
    'id',
    'weekDay',
    'time',
    'capacity',
    'coachId'
  )

  const workouts: { id: string }[] = await knex('workouts').select('id')
  const queue = workouts.map((workout) => workout.id)

  const nextWorkoutId = () => {
    const id = queue.shift()
    if (id === undefined) {
      throw new Error('no workouts available to schedule')
    }
    queue.push(id)
    return id
  }

  const monday = mondayOfCurrentWeek()
  const workoutByDate = new Map<string, string>()
  const sessions = []

  for (const offset of WEEK_OFFSETS) {
    for (const slot of slots) {
      const sessionDate = toIsoDate(
        addDays(monday, offset * 7 + DAY_INDEX[slot.weekDay])
      )

      const workoutId = workoutByDate.get(sessionDate) ?? nextWorkoutId()
      workoutByDate.set(sessionDate, workoutId)

      sessions.push({
        workoutScheduleId: slot.id,
        workoutId,
        weekDay: slot.weekDay,
        time: slot.time,
        sessionDate,
        capacity: slot.capacity,
        coachId: slot.coachId,
      })
    }
  }

  await knex('workout_sessions').insert(sessions)
}
