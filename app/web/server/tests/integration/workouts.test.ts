import { describe, expect, test } from 'bun:test'
import { createUser, createWorkout } from '../helpers/factories'
import { bearer } from '../helpers/auth'
import { api } from '../helpers/request'
import { owner } from '../helpers/db'

const payload = { warmUp: '400m row', skill: 'Snatch', wod: 'Fran' }

describe('read access', () => {
  test('any authenticated user lists workouts', async () => {
    const member = await createUser()
    await createWorkout('Murph')
    const res = await api('GET', '/workouts', { headers: await bearer(member) })
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  test('requires a token', async () => {
    const res = await api('GET', '/workouts')
    expect(res.status).toBe(401)
  })

  test('unknown id returns 404', async () => {
    const member = await createUser()
    const res = await api(
      'GET',
      '/workouts/00000000-0000-0000-0000-000000000000',
      { headers: await bearer(member) }
    )
    expect(res.status).toBe(404)
  })
})

describe('write access', () => {
  test('a member cannot create a workout', async () => {
    const member = await createUser()
    const res = await api('POST', '/workouts', {
      headers: await bearer(member),
      body: payload,
    })
    expect(res.status).toBe(403)
  })

  test('a coach creates a workout', async () => {
    const coach = await createUser({ isCoach: true })
    const res = await api('POST', '/workouts', {
      headers: await bearer(coach),
      body: payload,
    })
    expect(res.status).toBe(201)
    expect(res.body.wod).toBe('Fran')
  })

  test('an admin creates a workout', async () => {
    const admin = await createUser({ isAdmin: true })
    const res = await api('POST', '/workouts', {
      headers: await bearer(admin),
      body: payload,
    })
    expect(res.status).toBe(201)
  })

  test('rejects a missing wod with 400', async () => {
    const coach = await createUser({ isCoach: true })
    const res = await api('POST', '/workouts', {
      headers: await bearer(coach),
      body: { skill: 'Snatch' },
    })
    expect(res.status).toBe(400)
    expect(res.body.issues.length).toBeGreaterThan(0)
  })

  test('a coach updates a workout', async () => {
    const coach = await createUser({ isCoach: true })
    const id = await createWorkout('Old')
    const res = await api('PATCH', `/workouts/${id}`, {
      headers: await bearer(coach),
      body: { wod: 'New' },
    })
    expect(res.status).toBe(200)
    expect(res.body.wod).toBe('New')
  })

  test('a member cannot update a workout', async () => {
    const member = await createUser()
    const id = await createWorkout()
    const res = await api('PATCH', `/workouts/${id}`, {
      headers: await bearer(member),
      body: { wod: 'Hacked' },
    })
    expect(res.status).toBe(403)
  })
})

describe('soft delete', () => {
  test('deleted workout disappears from list and get', async () => {
    const coach = await createUser({ isCoach: true })
    const headers = await bearer(coach)
    const id = await createWorkout()

    expect((await api('DELETE', `/workouts/${id}`, { headers })).status).toBe(204)
    expect((await api('GET', `/workouts/${id}`, { headers })).status).toBe(404)
    expect((await api('GET', '/workouts', { headers })).body).toHaveLength(0)

    const row = await owner('workouts').select('deleted_at').where({ id }).first()
    expect(row.deleted_at).not.toBeNull()
  })

  test('a member cannot delete a workout', async () => {
    const member = await createUser()
    const id = await createWorkout()
    const res = await api('DELETE', `/workouts/${id}`, {
      headers: await bearer(member),
    })
    expect(res.status).toBe(403)
  })
})
