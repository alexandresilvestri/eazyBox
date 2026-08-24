import type { Knex } from 'knex'
import type { WeekDay } from '@eazybox/shared'

const DAYS: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

const TIMES = ['06:00', '07:00', '12:00', '18:00', '19:00']

export async function seed(knex: Knex) {
  const slots = DAYS.flatMap((weekDay) =>
    TIMES.map((time) => ({ weekDay, time }))
  )

  await knex('workout_schedule').insert(slots)
}
