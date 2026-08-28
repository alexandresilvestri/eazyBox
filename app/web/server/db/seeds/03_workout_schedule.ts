import type { Knex } from 'knex'
import { DEFAULT_CAPACITY } from '@eazybox/shared'
import type { WeekDay } from '@eazybox/shared'

const DAYS: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

const TIMES = ['06:00', '07:00', '12:00', '18:00', '19:00']

const MORNING_LIMIT = '12:00'

export async function seed(knex: Knex) {
  const [eveningCoach, morningCoach]: { id: string }[] = await knex('users')
    .select('id')
    .where({ isCoach: true })
    .orderBy('email')

  const coachFor = (time: string) =>
    (time < MORNING_LIMIT ? morningCoach?.id : eveningCoach?.id) ?? null

  const slots = DAYS.flatMap((weekDay) =>
    TIMES.map((time) => ({
      weekDay,
      time,
      capacity: DEFAULT_CAPACITY,
      coachId: coachFor(time),
    }))
  )

  await knex('workout_schedule').insert(slots)
}
