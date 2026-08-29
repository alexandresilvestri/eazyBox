import { describe, expect, test } from 'bun:test'
import { createCheckin, createSession, createUser } from '../helpers/factories'
import { bearer } from '../helpers/auth'
import { api } from '../helpers/request'
import { owner } from '../helpers/db'

const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000'

describe('create', () => {
  test('a member checks in', async () => {
    const member = await createUser()
    const session = await createSession()
    const res = await api('POST', '/checkins', {
      headers: await bearer(member),
      body: { workoutSessionId: session.id },
    })
    expect(res.status).toBe(201)
    expect(res.body.userId).toBe(member.id)
    expect(res.body.undone).toBe(false)
  })

  test('the check-in is always attributed to the caller', async () => {
    const member = await createUser()
    const other = await createUser()
    const session = await createSession()
    const res = await api('POST', '/checkins', {
      headers: await bearer(member),
      body: { workoutSessionId: session.id, userId: other.id },
    })
    expect(res.status).toBe(201)
    expect(res.body.userId).toBe(member.id)
  })

  test('an unknown session returns 404', async () => {
    const member = await createUser()
    const res = await api('POST', '/checkins', {
      headers: await bearer(member),
      body: { workoutSessionId: UNKNOWN_ID },
    })
    expect(res.status).toBe(404)
  })

  test('a soft deleted session returns 404', async () => {
    const member = await createUser()
    const session = await createSession()
    await owner('workout_sessions')
      .where({ id: session.id })
      .update({ deleted_at: new Date() })

    const res = await api('POST', '/checkins', {
      headers: await bearer(member),
      body: { workoutSessionId: session.id },
    })
    expect(res.status).toBe(404)
  })

  test('a second live check-in returns 409', async () => {
    const member = await createUser()
    const session = await createSession()
    const headers = await bearer(member)
    const body = { workoutSessionId: session.id }

    await api('POST', '/checkins', { headers, body })
    const res = await api('POST', '/checkins', { headers, body })
    expect(res.status).toBe(409)
  })

  test('a missing session id returns 400', async () => {
    const member = await createUser()
    const res = await api('POST', '/checkins', {
      headers: await bearer(member),
      body: {},
    })
    expect(res.status).toBe(400)
  })

  test('requires a token', async () => {
    expect((await api('POST', '/checkins', { body: {} })).status).toBe(401)
  })
})

describe('undo', () => {
  test('a member undoes their own check-in and can check in again', async () => {
    const member = await createUser()
    const session = await createSession()
    const headers = await bearer(member)
    const body = { workoutSessionId: session.id }

    const created = await api('POST', '/checkins', { headers, body })
    const undone = await api('PATCH', `/checkins/${created.body.id}/undo`, {
      headers,
    })
    expect(undone.status).toBe(200)
    expect(undone.body.undone).toBe(true)

    const again = await api('POST', '/checkins', { headers, body })
    expect(again.status).toBe(201)
  })

  test('undoing another member check-in returns 404', async () => {
    const member = await createUser()
    const other = await createUser()
    const session = await createSession()
    const [row] = await owner('checkins')
      .insert({ user_id: other.id, workout_session_id: session.id })
      .returning('id')

    const res = await api('PATCH', `/checkins/${row.id}/undo`, {
      headers: await bearer(member),
    })
    expect(res.status).toBe(404)
  })
})

describe('list isolation', () => {
  test('a member sees only their own check-ins', async () => {
    const member = await createUser()
    const other = await createUser()
    const session = await createSession()
    await owner('checkins').insert([
      { user_id: member.id, workout_session_id: session.id },
      { user_id: other.id, workout_session_id: session.id },
    ])

    const res = await api('GET', '/checkins', { headers: await bearer(member) })
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].userId).toBe(member.id)
  })

  test('a coach sees every check-in', async () => {
    const coach = await createUser({ isCoach: true })
    const member = await createUser()
    const session = await createSession()
    await owner('checkins').insert({
      user_id: member.id,
      workout_session_id: session.id,
    })

    const res = await api('GET', '/checkins', { headers: await bearer(coach) })
    expect(res.body).toHaveLength(1)
  })

  test('an admin sees every check-in', async () => {
    const admin = await createUser({ isAdmin: true })
    const member = await createUser()
    const session = await createSession()
    await owner('checkins').insert({
      user_id: member.id,
      workout_session_id: session.id,
    })

    const res = await api('GET', '/checkins', { headers: await bearer(admin) })
    expect(res.body).toHaveLength(1)
  })
})

describe('rules the API leaves to the client', () => {
  test('a member can take the last seat of a session', async () => {
    const member = await createUser()
    const session = await createSession('2026-08-24', { capacity: 1 })
    const res = await api('POST', '/checkins', {
      headers: await bearer(member),
      body: { workoutSessionId: session.id },
    })
    expect(res.status).toBe(201)
  })

  test('capacity is not enforced server side, so a full session still accepts a check-in', async () => {
    const first = await createUser()
    const second = await createUser()
    const session = await createSession('2026-08-24', { capacity: 1 })
    await createCheckin(first.id, session.id)

    const res = await api('POST', '/checkins', {
      headers: await bearer(second),
      body: { workoutSessionId: session.id },
    })
    expect(res.status).toBe(201)

    const stats = await api('GET', '/workout-sessions', {
      headers: await bearer(second),
    })
    const row = stats.body.find(
      (entry: { id: string }) => entry.id === session.id
    )
    expect(row.occupied).toBeGreaterThan(row.capacity)
  })

  test('the check-in window is not enforced server side, so a long past session still accepts one', async () => {
    const member = await createUser()
    const session = await createSession('2020-01-06')
    const res = await api('POST', '/checkins', {
      headers: await bearer(member),
      body: { workoutSessionId: session.id },
    })
    expect(res.status).toBe(201)
  })

  test('the check-in window is not enforced server side, so a far future session still accepts one', async () => {
    const member = await createUser()
    const session = await createSession('2099-12-28')
    const res = await api('POST', '/checkins', {
      headers: await bearer(member),
      body: { workoutSessionId: session.id },
    })
    expect(res.status).toBe(201)
  })
})
