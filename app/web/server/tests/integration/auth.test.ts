import { describe, expect, test } from 'bun:test'
import { createUser, TEST_PASSWORD } from '../helpers/factories'
import { bearer } from '../helpers/auth'
import { api } from '../helpers/request'
import { owner } from '../helpers/db'

const login = (email: string, password = TEST_PASSWORD) =>
  api('POST', '/mobile/auth/login', { body: { email, password } })

describe('login', () => {
  test('returns a token pair for valid credentials', async () => {
    const user = await createUser()
    const res = await login(user.email)
    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeString()
    expect(res.body.refreshToken).toBeString()
  })

  test('sets httpOnly cookies for the web client', async () => {
    const user = await createUser()
    const res = await api('POST', '/auth/login', {
      body: { email: user.email, password: TEST_PASSWORD },
    })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })

  test('rejects a wrong password', async () => {
    const user = await createUser()
    const res = await login(user.email, 'wrong-password')
    expect(res.status).toBe(401)
  })

  test('rejects an unknown email', async () => {
    const res = await login('nobody@test.com')
    expect(res.status).toBe(401)
  })

  test('rejects an inactive account with 403', async () => {
    const user = await createUser({ isActive: false })
    const res = await login(user.email)
    expect(res.status).toBe(403)
  })

  test('rejects a soft deleted account', async () => {
    const user = await createUser()
    await owner('users')
      .where({ id: user.id })
      .update({ deleted_at: new Date() })
    const res = await login(user.email)
    expect(res.status).toBe(401)
  })

  test('rejects an invalid payload', async () => {
    const res = await api('POST', '/mobile/auth/login', {
      body: { email: 'not-an-email' },
    })
    expect(res.status).toBe(400)
  })
})

describe('refresh', () => {
  test('rotates the token pair', async () => {
    const user = await createUser()
    const first = await login(user.email)
    const res = await api('POST', '/mobile/auth/refresh', {
      body: { refreshToken: first.body.refreshToken },
    })
    expect(res.status).toBe(200)
    expect(res.body.refreshToken).not.toBe(first.body.refreshToken)
  })

  test('rejects a replayed refresh token', async () => {
    const user = await createUser()
    const first = await login(user.email)
    const body = { refreshToken: first.body.refreshToken }
    await api('POST', '/mobile/auth/refresh', { body })
    const replay = await api('POST', '/mobile/auth/refresh', { body })
    expect(replay.status).toBe(401)
  })

  test('rejects a garbage refresh token', async () => {
    const res = await api('POST', '/mobile/auth/refresh', {
      body: { refreshToken: 'not-a-jwt' },
    })
    expect(res.status).toBe(401)
  })

  test('reflects a demotion made after the token was issued', async () => {
    const user = await createUser({ isAdmin: true })
    const first = await login(user.email)
    await owner('users').where({ id: user.id }).update({ is_admin: false })

    const rotated = await api('POST', '/mobile/auth/refresh', {
      body: { refreshToken: first.body.refreshToken },
    })
    const res = await api('GET', '/users', {
      headers: { Authorization: `Bearer ${rotated.body.accessToken}` },
    })
    expect(res.body).toHaveLength(1)
  })
})

describe('logout', () => {
  test('revokes the refresh token', async () => {
    const user = await createUser()
    const first = await login(user.email)
    const body = { refreshToken: first.body.refreshToken }

    const out = await api('POST', '/mobile/auth/logout', { body })
    expect(out.status).toBe(204)

    const after = await api('POST', '/mobile/auth/refresh', { body })
    expect(after.status).toBe(401)
  })
})

describe('me', () => {
  test('returns the current user without the password', async () => {
    const user = await createUser()
    const res = await api('GET', '/auth/me', { headers: await bearer(user) })
    expect(res.status).toBe(200)
    expect(res.body.email).toBe(user.email)
    expect(res.body).not.toHaveProperty('password')
  })

  test('requires a token', async () => {
    const res = await api('GET', '/auth/me')
    expect(res.status).toBe(401)
  })
})
