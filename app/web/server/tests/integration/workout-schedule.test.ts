import { describe, expect, test } from 'bun:test'
import { createSlot, createUser } from '../helpers/factories'
import { bearer } from '../helpers/auth'
import { api } from '../helpers/request'

const payload = { weekDay: 'monday', time: '06:00' }

describe('read access', () => {
  test('any authenticated user lists the schedule', async () => {
    const member = await createUser()
    await createSlot('tuesday', '07:00')
    const res = await api('GET', '/workout-schedule', {
      headers: await bearer(member),
    })
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  test('requires a token', async () => {
    expect((await api('GET', '/workout-schedule')).status).toBe(401)
  })
})

describe('write access', () => {
  test('a member cannot create a slot', async () => {
    const member = await createUser()
    const res = await api('POST', '/workout-schedule', {
      headers: await bearer(member),
      body: payload,
    })
    expect(res.status).toBe(403)
  })

  test('a coach cannot create a slot', async () => {
    const coach = await createUser({ isCoach: true })
    const res = await api('POST', '/workout-schedule', {
      headers: await bearer(coach),
      body: payload,
    })
    expect(res.status).toBe(403)
  })

  test('an admin creates a slot', async () => {
    const admin = await createUser({ isAdmin: true })
    const res = await api('POST', '/workout-schedule', {
      headers: await bearer(admin),
      body: payload,
    })
    expect(res.status).toBe(201)
    expect(res.body.weekDay).toBe('monday')
  })

  test('a duplicate slot returns 409', async () => {
    const admin = await createUser({ isAdmin: true })
    const headers = await bearer(admin)
    await api('POST', '/workout-schedule', { headers, body: payload })
    const res = await api('POST', '/workout-schedule', { headers, body: payload })
    expect(res.status).toBe(409)
  })

  test('an invalid week day returns 400', async () => {
    const admin = await createUser({ isAdmin: true })
    const res = await api('POST', '/workout-schedule', {
      headers: await bearer(admin),
      body: { weekDay: 'funday', time: '06:00' },
    })
    expect(res.status).toBe(400)
  })

  test('an invalid time returns 400', async () => {
    const admin = await createUser({ isAdmin: true })
    const res = await api('POST', '/workout-schedule', {
      headers: await bearer(admin),
      body: { weekDay: 'monday', time: '25:00' },
    })
    expect(res.status).toBe(400)
  })

  test('an admin soft deletes a slot', async () => {
    const admin = await createUser({ isAdmin: true })
    const headers = await bearer(admin)
    const slot = await createSlot('friday', '18:00')

    expect(
      (await api('DELETE', `/workout-schedule/${slot.id}`, { headers })).status
    ).toBe(204)
    expect(
      (await api('GET', `/workout-schedule/${slot.id}`, { headers })).status
    ).toBe(404)
  })

  test('the same slot can be recreated after a soft delete', async () => {
    const admin = await createUser({ isAdmin: true })
    const headers = await bearer(admin)
    const created = await api('POST', '/workout-schedule', { headers, body: payload })
    await api('DELETE', `/workout-schedule/${created.body.id}`, { headers })
    const again = await api('POST', '/workout-schedule', { headers, body: payload })
    expect(again.status).toBe(201)
  })
})
