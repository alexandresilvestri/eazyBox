import type { Knex } from 'knex'

const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const TIMES = ['06:00', '07:00', '08:00', '17:00', '18:00', '19:00', '20:00']
const CAPACITY = 20
const COACH_EMAIL = 'arthur.amaral@outlook.com'

const slotKey = (weekDay: string, time: string) =>
  `${weekDay} ${time.slice(0, 5)}`

export async function up(knex: Knex): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  const coach = await knex('users')
    .select('id')
    .where({ email: COACH_EMAIL })
    .first()

  const existing = await knex('workout_schedule')
    .select('week_day', 'time')
    .whereNull('deleted_at')

  const taken = new Set(
    existing.map((slot) => slotKey(slot.week_day, slot.time))
  )

  const slots = WEEK_DAYS.flatMap((week_day) =>
    TIMES.map((time) => ({
      week_day,
      time,
      capacity: CAPACITY,
      coach_id: coach?.id ?? null,
    }))
  ).filter((slot) => !taken.has(slotKey(slot.week_day, slot.time)))

  if (slots.length === 0) return

  await knex('workout_schedule').insert(slots)
}

export async function down(knex: Knex): Promise<void> {
  await knex('workout_schedule')
    .whereIn('week_day', WEEK_DAYS)
    .whereIn('time', TIMES)
    .whereNotExists((builder) =>
      builder
        .select(knex.raw('1'))
        .from('workout_sessions')
        .whereRaw('workout_sessions.workout_schedule_id = workout_schedule.id')
    )
    .delete()
}
