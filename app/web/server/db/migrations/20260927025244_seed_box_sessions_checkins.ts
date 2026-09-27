import type { Knex } from 'knex'

const TIMES = ['06:00', '07:00', '08:00', '17:00', '18:00', '19:00', '20:00']

const DAYS = [
  {
    day: '2026-09-28',
    week_day: 'monday',
    workout_id: 'f4615e1d-7189-4e22-9d23-d2419b35ef3b',
  },
  {
    day: '2026-09-29',
    week_day: 'tuesday',
    workout_id: '700ea767-d3e2-43cb-af21-492a27abd017',
  },
  {
    day: '2026-09-30',
    week_day: 'wednesday',
    workout_id: 'ef3c0e4a-453b-4402-bb44-1bf535f9da37',
  },
  {
    day: '2026-10-01',
    week_day: 'thursday',
    workout_id: 'a34f30aa-720a-41b9-b68d-074df68100a9',
  },
  {
    day: '2026-10-02',
    week_day: 'friday',
    workout_id: '8cf7edcc-1f4c-4eb1-9eb9-9a0903e946b8',
  },
]

const DATES = DAYS.map((entry) => entry.day)

const OCCUPANCY: Record<string, [number, number]> = {
  '06:00': [8, 14],
  '07:00': [8, 14],
  '08:00': [3, 8],
  '17:00': [3, 8],
  '18:00': [14, 20],
  '19:00': [14, 20],
  '20:00': [3, 8],
}

const MEMBER_DOMAINS = ['%@gmail.com', '%@outlook.com']
const RANDOM_SEED = 20260928
const RANDOM_MULTIPLIER = 16807
const RANDOM_MODULUS = 2147483647
const SEAT_STRIDE = 3

const slotKey = (weekDay: string, time: string) =>
  `${weekDay} ${time.slice(0, 5)}`

const sessionKey = (scheduleId: string, day: string) => `${scheduleId} ${day}`

const rollSeries = (seed: number) => {
  let state = seed
  return (range: number) => {
    state = (state * RANDOM_MULTIPLIER) % RANDOM_MODULUS
    return state % range
  }
}

const loadSlots = (knex: Knex) =>
  knex('workout_schedule')
    .select('id', 'week_day', 'time', 'capacity', 'coach_id')
    .whereIn(
      'week_day',
      DAYS.map((entry) => entry.week_day)
    )
    .whereIn('time', TIMES)
    .whereNull('deleted_at')

const loadSessions = (knex: Knex) =>
  knex('workout_sessions')
    .select(
      'id',
      'workout_schedule_id',
      'time',
      'capacity',
      knex.raw("to_char(session_date, 'YYYY-MM-DD') as day")
    )
    .whereIn('session_date', DATES)
    .whereNull('deleted_at')
    .orderBy(['session_date', 'time'])

const loadMembers = (knex: Knex) =>
  knex('users')
    .select('id')
    .where({ is_admin: false, is_coach: false, is_active: true })
    .whereNull('deleted_at')
    .where((builder) => {
      for (const domain of MEMBER_DOMAINS) {
        builder.orWhere('email', 'like', domain)
      }
    })
    .orderBy('email')

export async function up(knex: Knex): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  const slots = await loadSlots(knex)
  const slotByKey = new Map(
    slots.map((slot) => [slotKey(slot.week_day, slot.time), slot])
  )

  const published = await loadSessions(knex)
  const publishedKeys = new Set(
    published.map((session) =>
      sessionKey(session.workout_schedule_id, session.day)
    )
  )

  const sessions = []

  for (const entry of DAYS) {
    for (const time of TIMES) {
      const slot = slotByKey.get(slotKey(entry.week_day, time))
      if (!slot || publishedKeys.has(sessionKey(slot.id, entry.day))) continue

      sessions.push({
        workout_schedule_id: slot.id,
        workout_id: entry.workout_id,
        week_day: entry.week_day,
        time: slot.time,
        session_date: entry.day,
        capacity: slot.capacity,
        coach_id: slot.coach_id,
      })
    }
  }

  if (sessions.length > 0) {
    await knex('workout_sessions').insert(sessions)
  }

  const members = await loadMembers(knex)
  if (members.length === 0) return

  const scheduled = await loadSessions(knex)
  const attended = await knex('checkins')
    .select('user_id', 'workout_session_id')
    .whereIn(
      'workout_session_id',
      scheduled.map((session) => session.id)
    )
    .where({ undone: false })

  const taken = new Set(
    attended.map(
      (checkin) => `${checkin.user_id} ${checkin.workout_session_id}`
    )
  )

  const roll = rollSeries(RANDOM_SEED)
  const checkins: { user_id: string; workout_session_id: string }[] = []
  let cursor = 0

  for (const session of scheduled) {
    const [min, max] = OCCUPANCY[session.time.slice(0, 5)] ?? [0, 0]
    const ceiling = Math.min(max, session.capacity, members.length)
    const floor = Math.min(min, ceiling)
    const attendees = floor + roll(ceiling - floor + 1)

    const seated = new Set<string>()

    for (let seat = 0; seat < attendees; seat++) {
      const member = members[(cursor + seat * SEAT_STRIDE) % members.length]
      const key = `${member.id} ${session.id}`
      if (taken.has(key) || seated.has(key)) continue

      seated.add(key)
      checkins.push({ user_id: member.id, workout_session_id: session.id })
    }

    cursor = (cursor + attendees) % members.length
  }

  if (checkins.length > 0) {
    await knex('checkins').insert(checkins)
  }
}

export async function down(knex: Knex): Promise<void> {
  const sessions = await knex('workout_sessions')
    .select('id')
    .whereIn('session_date', DATES)

  await knex('checkins')
    .whereIn(
      'workout_session_id',
      sessions.map((session) => session.id)
    )
    .delete()

  await knex('workout_sessions').whereIn('session_date', DATES).delete()
}
