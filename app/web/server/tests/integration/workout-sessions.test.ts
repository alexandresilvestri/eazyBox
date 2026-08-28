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

describe('occupancy and coach', () => {
  test('a session carries its capacity, coach and occupied seats', async () => {
    const coach = await createUser({ isCoach: true, firstName: 'Bruno' })
    const member = await createUser()
    const session = await createSession('2026-08-24', {
      capacity: 14,
      coachId: coach.id,
    })
    await api('POST', '/checkins', {
      headers: await bearer(member),
      body: { workoutSessionId: session.id },
    })

    const res = await api('GET', '/workout-sessions', {
      headers: await bearer(member),
    })
    expect(res.body[0].capacity).toBe(14)
    expect(res.body[0].occupied).toBe(1)
    expect(res.body[0].coach).toMatchObject({
      id: coach.id,
      firstName: 'Bruno',
    })
  })

  test('a session with no coach reports null', async () => {
    const member = await createUser()
    await createSession()
    const res = await api('GET', '/workout-sessions', {
      headers: await bearer(member),
    })
    expect(res.body[0].coach).toBeNull()
    expect(res.body[0].occupied).toBe(0)
  })

  test('a member counts seats taken by other members', async () => {
    const member = await createUser()
    const other = await createUser()
    const session = await createSession()
    await api('POST', '/checkins', {
      headers: await bearer(other),
      body: { workoutSessionId: session.id },
    })

    const res = await api('GET', '/workout-sessions', {
      headers: await bearer(member),
    })
    expect(res.body[0].occupied).toBe(1)
    expect(
      (await api('GET', '/checkins', { headers: await bearer(member) })).body
    ).toHaveLength(0)
  })

  test('a new check-in busts the cached list', async () => {
    const member = await createUser()
    const other = await createUser()
    const session = await createSession()
    const headers = await bearer(member)

    expect(
      (await api('GET', '/workout-sessions', { headers })).body[0].occupied
    ).toBe(0)
    await api('POST', '/checkins', {
      headers: await bearer(other),
      body: { workoutSessionId: session.id },
    })
    expect(
      (await api('GET', '/workout-sessions', { headers })).body[0].occupied
    ).toBe(1)
  })
})

describe('attendees', () => {
  test('a member reads the roster with the other names', async () => {
    const member = await createUser({ firstName: 'Ana', lastName: 'Silva' })
    const other = await createUser({ firstName: 'Diego', lastName: 'Costa' })
    const coach = await createUser({ isCoach: true, firstName: 'Bruno' })
    const session = await createSession()

    for (const attendee of [member, other, coach]) {
      await api('POST', '/checkins', {
        headers: await bearer(attendee),
        body: { workoutSessionId: session.id },
      })
    }

    const res = await api('GET', `/workout-sessions/${session.id}/attendees`, {
      headers: await bearer(member),
    })
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(3)
    expect(res.body.map((row: { firstName: string }) => row.firstName)).toEqual(
      ['Ana', 'Bruno', 'Diego']
    )
    expect(
      res.body.find((row: { firstName: string }) => row.firstName === 'Bruno')
        .isCoach
    ).toBe(true)
  })

  test('an undone check-in leaves the roster', async () => {
    const member = await createUser()
    const session = await createSession()
    const headers = await bearer(member)
    const created = await api('POST', '/checkins', {
      headers,
      body: { workoutSessionId: session.id },
    })
    await api('PATCH', `/checkins/${created.body.id}/undo`, { headers })

    const res = await api('GET', `/workout-sessions/${session.id}/attendees`, {
      headers,
    })
    expect(res.body).toHaveLength(0)
  })

  test('an unknown session returns 404', async () => {
    const member = await createUser()
    const res = await api('GET', `/workout-sessions/${UNKNOWN_ID}/attendees`, {
      headers: await bearer(member),
    })
    expect(res.status).toBe(404)
  })
})

describe('adding an attendee', () => {
  test('a coach confirms a member who forgot', async () => {
    const coach = await createUser({ isCoach: true })
    const member = await createUser({ firstName: 'Ana', lastName: 'Silva' })
    const session = await createSession()

    const res = await api('POST', `/workout-sessions/${session.id}/attendees`, {
      headers: await bearer(coach),
      body: { userId: member.id },
    })
    expect(res.status).toBe(201)
    expect(res.body.userId).toBe(member.id)

    const roster = await api(
      'GET',
      `/workout-sessions/${session.id}/attendees`,
      { headers: await bearer(member) }
    )
    expect(roster.body).toHaveLength(1)
    expect(roster.body[0].checkedInAt).toBeString()

    const list = await api('GET', '/workout-sessions', {
      headers: await bearer(coach),
    })
    expect(list.body[0].occupied).toBe(1)
  })

  test('a member cannot confirm someone else', async () => {
    const member = await createUser()
    const other = await createUser()
    const session = await createSession()
    const res = await api('POST', `/workout-sessions/${session.id}/attendees`, {
      headers: await bearer(member),
      body: { userId: other.id },
    })
    expect(res.status).toBe(403)
  })

  test('a duplicate confirmation returns 409', async () => {
    const coach = await createUser({ isCoach: true })
    const member = await createUser()
    const session = await createSession()
    const options = {
      headers: await bearer(coach),
      body: { userId: member.id },
    }
    await api('POST', `/workout-sessions/${session.id}/attendees`, options)
    const res = await api(
      'POST',
      `/workout-sessions/${session.id}/attendees`,
      options
    )
    expect(res.status).toBe(409)
  })

  test('an unknown session returns 404', async () => {
    const coach = await createUser({ isCoach: true })
    const member = await createUser()
    const res = await api('POST', `/workout-sessions/${UNKNOWN_ID}/attendees`, {
      headers: await bearer(coach),
      body: { userId: member.id },
    })
    expect(res.status).toBe(404)
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

  test('a coach creates a session and inherits the slot', async () => {
    const coach = await createUser({ isCoach: true })
    const slot = await createSlot('wednesday', '19:30', {
      capacity: 24,
      coachId: coach.id,
    })
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
    expect(res.body.capacity).toBe(24)
    expect(res.body.coachId).toBe(coach.id)
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
      (await api('DELETE', `/workout-sessions/${session.id}`, { headers }))
        .status
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
