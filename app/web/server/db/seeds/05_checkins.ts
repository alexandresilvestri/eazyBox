import type { Knex } from 'knex'

const LIVE_PER_PAST_SESSION = 6
const LIVE_PER_FUTURE_SESSION = 2
const UNDONE_EVERY = 9
const SEAT_STRIDE = 3

export async function seed(knex: Knex) {
  const members: { id: string }[] = await knex('users')
    .select('id')
    .where({ isAdmin: false, isCoach: false, isActive: true })
    .whereNull('deletedAt')
    .orderBy('email')

  const sessions: { id: string; sessionDate: Date }[] = await knex(
    'workout_sessions'
  )
    .select('id', 'sessionDate')
    .orderBy(['sessionDate', 'time'])

  const roster = [...members, ...members]
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const checkins: {
    userId: string
    workoutSessionId: string
    undone: boolean
  }[] = []

  sessions.forEach((session, index) => {
    const seats =
      new Date(session.sessionDate) <= endOfToday
        ? LIVE_PER_PAST_SESSION
        : LIVE_PER_FUTURE_SESSION

    const start = (index * SEAT_STRIDE) % members.length
    const attending = roster.slice(start, start + seats + 1)

    attending.forEach((member, position) => {
      const undone = position === seats
      if (undone && index % UNDONE_EVERY !== 0) {
        return
      }
      checkins.push({
        userId: member.id,
        workoutSessionId: session.id,
        undone,
      })
    })
  })

  await knex('checkins').insert(checkins)
}
