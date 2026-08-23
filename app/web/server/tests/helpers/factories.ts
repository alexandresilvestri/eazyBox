import { owner } from './db'
import type { User } from '@eazybox/shared'

type UserOverrides = Partial<
  Pick<
    User,
    'email' | 'firstName' | 'lastName' | 'isActive' | 'isAdmin' | 'isCoach'
  >
>

export const TEST_PASSWORD = 'password123'

const passwordDigest = Bun.password.hash(TEST_PASSWORD)

let sequence = 0
const nextEmail = () => `user${++sequence}@test.com`

export async function createUser(overrides: UserOverrides = {}): Promise<User> {
  const [user] = await owner('users')
    .insert({
      email: overrides.email ?? nextEmail(),
      password: await passwordDigest,
      first_name: overrides.firstName ?? 'Test',
      last_name: overrides.lastName ?? 'User',
      is_active: overrides.isActive ?? true,
      is_admin: overrides.isAdmin ?? false,
      is_coach: overrides.isCoach ?? false,
    })
    .returning('*')
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    isActive: user.is_active,
    isAdmin: user.is_admin,
    isCoach: user.is_coach,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  }
}

export async function createWorkout(wod = 'Fran') {
  const [row] = await owner('workouts').insert({ wod }).returning('id')
  return row.id as string
}

export async function createSlot(weekDay = 'monday', time = '06:00') {
  const [row] = await owner('workout_schedule')
    .insert({ week_day: weekDay, time })
    .returning(['id', 'week_day', 'time'])
  return { id: row.id as string, weekDay, time }
}

export async function createSession(sessionDate = '2026-08-24') {
  const existing = await owner('workout_schedule')
    .select('id', 'week_day', 'time')
    .first()
  const slot = existing
    ? {
        id: existing.id as string,
        weekDay: existing.week_day,
        time: existing.time,
      }
    : await createSlot()
  const workoutId = await createWorkout()

  const [session] = await owner('workout_sessions')
    .insert({
      workout_schedule_id: slot.id,
      workout_id: workoutId,
      week_day: slot.weekDay,
      time: slot.time,
      session_date: sessionDate,
    })
    .returning('id')

  return {
    id: session.id as string,
    workoutScheduleId: slot.id,
    workoutId,
  }
}
