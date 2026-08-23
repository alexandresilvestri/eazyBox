import { describe, expect, test } from 'bun:test'
import { createUser, TEST_PASSWORD } from '../helpers/factories'
import { bearer } from '../helpers/auth'
import { api } from '../helpers/request'

const COLLECTIONS = [
  '/users',
  '/workouts',
  '/workout-schedule',
  '/workout-sessions',
  '/checkins',
]

describe('public routes', () => {
  test('health needs no token', async () => {
    const res = await api('GET', '/health')
    expect(res.status).toBe(200)
  })

  test('login needs no token', async () => {
    const user = await createUser()
    const res = await api('POST', '/auth/login', {
      body: { email: user.email, password: TEST_PASSWORD },
    })
    expect(res.status).toBe(200)
  })
})

describe('protected by default', () => {
  test.each(COLLECTIONS)('%s rejects a request with no token', async (path) => {
    const res = await api('GET', path)
    expect(res.status).toBe(401)
  })

  test.each(COLLECTIONS)('%s exposes services on the context', async (path) => {
    const member = await createUser()
    const res = await api('GET', path, { headers: await bearer(member) })
    expect(res.status).toBe(200)
  })
})

describe('transport is chosen by route, not by header', () => {
  test('the cookie mount never returns tokens in the body', async () => {
    const user = await createUser()
    const res = await api('POST', '/auth/login', {
      body: { email: user.email, password: TEST_PASSWORD },
    })
    expect(res.body).toEqual({ ok: true })
  })

  test('a forged X-Client header cannot downgrade the cookie mount', async () => {
    const user = await createUser()
    const res = await api('POST', '/auth/login', {
      headers: { 'X-Client': 'mobile' },
      body: { email: user.email, password: TEST_PASSWORD },
    })
    expect(res.body).toEqual({ ok: true })
    expect(res.body).not.toHaveProperty('refreshToken')
  })

  test('the token mount returns a token pair', async () => {
    const user = await createUser()
    const res = await api('POST', '/mobile/auth/login', {
      body: { email: user.email, password: TEST_PASSWORD },
    })
    expect(res.body.accessToken).toBeString()
    expect(res.body.refreshToken).toBeString()
  })
})

describe('connection pool', () => {
  test('concurrent collection requests beyond pool size all complete', async () => {
    const member = await createUser()
    const headers = await bearer(member)
    const results = await Promise.all(
      Array.from({ length: 12 }, () =>
        api('GET', '/users', { headers }).then((res) => res.status)
      )
    )
    expect(results).toEqual(Array(12).fill(200))
  })
})
