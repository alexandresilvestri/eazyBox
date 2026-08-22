import { describe, expect, test } from 'bun:test'
import {
  createSession,
  createSlot,
  createUser,
  createWorkout,
} from '../helpers/factories'
import { bearer } from '../helpers/auth'
import { api } from '../helpers/request'

const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000'

describe('read access', () => {
  test('any authenticated user lists sessions', async () => {
    const member = await createUser()
    await createSession()
    const res = await api('GET', '/workout-sessions', {
      headers: await bearer(member),
    })
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  test('filters by from date', async () => {
    const member = await createUser()
    await createSession('2026-08-24')
    await createSession('2026-09-01')
    const res = await api('GET', '/workout-sessions?from=2026-08-30', {
      headers: await bearer(member),
    })
    expect(res.body).toHaveLength(1)
    expect(res.body[0].sessionDate).toContain('2026-09-01')
  })

  test('requires a token', async () => {
    expect((await api('GET', '/workout-sessions')).status).toBe(401)
  })
})

describe('create', () => {
  test('a member cannot create a session', async () => {
    const member = await createUser()
    const slot = await createSlot()
    const workoutId = await createWorkout()
    const res = await api('POST', '/workout-sessions', {
      headers: await bearer(member),
      body: {
        workoutScheduleId: slot.id,
        workoutId,
        sessionDate: '2026-08-24',
      },
    })
    expect(res.status).toBe(403)
  })

  test('a coach creates a session and inherits the slot time', async () => {
    const coach = await createUser({ isCoach: true })
    const slot = await createSlot('wednesday', '19:30')
    const workoutId = await createWorkout()
    const res = await api('POST', '/workout-sessions', {
      headers: await bearer(coach),
      body: {
        workoutScheduleId: slot.id,
        workoutId,
        sessionDate: '2026-08-26',
      },
    })
    expect(res.status).toBe(201)
    expect(res.body.weekDay).toBe('wednesday')
    expect(res.body.time).toBe('19:30:00')
  })

  test('an unknown schedule slot returns 404', async () => {
    const coach = await createUser({ isCoach: true })
    const workoutId = await createWorkout()
    const res = await api('POST', '/workout-sessions', {
      headers: await bearer(coach),
      body: {
        workoutScheduleId: UNKNOWN_ID,
        workoutId,
        sessionDate: '2026-08-24',
      },
    })
    expect(res.status).toBe(404)
  })

  test('an unknown workout returns 404', async () => {
    const coach = await createUser({ isCoach: true })
    const slot = await createSlot()
    const res = await api('POST', '/workout-sessions', {
      headers: await bearer(coach),
      body: {
        workoutScheduleId: slot.id,
        workoutId: UNKNOWN_ID,
        sessionDate: '2026-08-24',
      },
    })
    expect(res.status).toBe(404)
  })

  test('a duplicate slot and date returns 409', async () => {
    const coach = await createUser({ isCoach: true })
    const headers = await bearer(coach)
    const slot = await createSlot()
    const workoutId = await createWorkout()
    const body = {
      workoutScheduleId: slot.id,
      workoutId,
      sessionDate: '2026-08-24',
    }
    await api('POST', '/workout-sessions', { headers, body })
    const res = await api('POST', '/workout-sessions', { headers, body })
    expect(res.status).toBe(409)
  })

  test('a malformed session date returns 400', async () => {
    const coach = await createUser({ isCoach: true })
    const slot = await createSlot()
    const workoutId = await createWorkout()
    const res = await api('POST', '/workout-sessions', {
      headers: await bearer(coach),
      body: {
        workoutScheduleId: slot.id,
        workoutId,
        sessionDate: '24/08/2026',
      },
    })
    expect(res.status).toBe(400)
  })
})

describe('update and delete', () => {
  test('a coach swaps the workout', async () => {
    const coach = await createUser({ isCoach: true })
    const session = await createSession()
    const replacement = await createWorkout('Murph')
    const res = await api('PATCH', `/workout-sessions/${session.id}`, {
      headers: await bearer(coach),
      body: { workoutId: replacement },
    })
    expect(res.status).toBe(200)
    expect(res.body.workoutId).toBe(replacement)
  })

  test('swapping to an unknown workout returns 404', async () => {
    const coach = await createUser({ isCoach: true })
    const session = await createSession()
    const res = await api('PATCH', `/workout-sessions/${session.id}`, {
      headers: await bearer(coach),
      body: { workoutId: UNKNOWN_ID },
    })
    expect(res.status).toBe(404)
  })

  test('a soft deleted session disappears', async () => {
    const coach = await createUser({ isCoach: true })
    const headers = await bearer(coach)
    const session = await createSession()

    expect(
      (await api('DELETE', `/workout-sessions/${session.id}`, { headers })).status
    ).toBe(204)
    expect(
      (await api('GET', `/workout-sessions/${session.id}`, { headers })).status
    ).toBe(404)
  })

  test('a member cannot delete a session', async () => {
    const member = await createUser()
    const session = await createSession()
    const res = await api('DELETE', `/workout-sessions/${session.id}`, {
      headers: await bearer(member),
    })
    expect(res.status).toBe(403)
  })
})
