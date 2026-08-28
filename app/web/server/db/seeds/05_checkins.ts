import type { Knex } from 'knex'
import type { WeekDay } from '@eazybox/shared'

const BASE_BY_TIME: Record<string, number> = {
  '06:00': 9,
  '07:00': 14,
  '12:00': 6,
  '18:00': 16,
  '19:00': 12,
}

const DAY_DELTA: Record<WeekDay, number> = {
  monday: 2,
  tuesday: -1,
  wednesday: 1,
  thursday: -2,
  friday: -4,
  saturday: -6,
  sunday: -7,
}

const WEEK_JITTER = [-3, 1, -1, 2]

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000

const FALLBACK_BASE = 10
const FUTURE_RATIO = 0.35
const MIN_LIVE = 2
const UNDONE_EVERY = 9
const SEAT_STRIDE = 3

const weekJitter = (date: Date) =>
  WEEK_JITTER[Math.floor(date.getTime() / MS_PER_WEEK) % WEEK_JITTER.length] ??
  0

export async function seed(knex: Knex) {
  const members: { id: string }[] = await knex('users')
    .select('id')
    .where({ isAdmin: false, isCoach: false, isActive: true })
    .whereNull('deletedAt')
    .orderBy('email')

  const sessions: {
    id: string
    sessionDate: Date
    weekDay: WeekDay
    time: string
    capacity: number
  }[] = await knex('workout_sessions')
    .select('id', 'sessionDate', 'weekDay', 'time', 'capacity')
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
    const sessionDate = new Date(session.sessionDate)
    const base = BASE_BY_TIME[session.time.slice(0, 5)] ?? FALLBACK_BASE
    const expected = base + DAY_DELTA[session.weekDay] + weekJitter(sessionDate)
    const upcoming = sessionDate > endOfToday
    const maxLive = Math.min(members.length - 1, session.capacity)
    const seats = Math.min(
      Math.max(
        upcoming ? Math.round(expected * FUTURE_RATIO) : expected,
        MIN_LIVE
      ),
      maxLive
    )

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
