import { describe, expect, test } from 'bun:test'
import { createUser, TEST_PASSWORD } from '../helpers/factories'
import { bearer } from '../helpers/auth'
import { api } from '../helpers/request'
import { redis } from '../../redis'

const NEW_PASSWORD = 'brand-new-password'

const login = (email: string, password = TEST_PASSWORD) =>
  api('POST', '/mobile/auth/login', { body: { email, password } })

const forgot = (email: string) =>
  api('POST', '/mobile/auth/forgot-password', { body: { email } })

const reset = (token: string, password = NEW_PASSWORD) =>
  api('POST', '/mobile/auth/reset-password', { body: { token, password } })

const resetKeys = () => redis.keys('password-reset:*')

const grantToken = async (userId: string, token = 'fixed-reset-token') => {
  const hash = new Bun.CryptoHasher('sha256').update(token).digest('hex')
  await redis.set(`password-reset:${hash}`, userId, 'EX', 600)
  return token
}

describe('forgot-password', () => {
  test('stores a reset token for a known email', async () => {
    const user = await createUser()
    const res = await forgot(user.email)
    expect(res.status).toBe(204)
    expect(await resetKeys()).toHaveLength(1)
  })

  test('answers 204 for an unknown email without storing a token', async () => {
    const res = await forgot('nobody@test.com')
    expect(res.status).toBe(204)
    expect(await resetKeys()).toHaveLength(0)
  })

  test('stores nothing for an inactive account', async () => {
    const user = await createUser({ isActive: false })
    const res = await forgot(user.email)
    expect(res.status).toBe(204)
    expect(await resetKeys()).toHaveLength(0)
  })

  test('throttles a second request for the same email', async () => {
    const user = await createUser()
    await forgot(user.email)
    const res = await forgot(user.email)
    expect(res.status).toBe(204)
    expect(await resetKeys()).toHaveLength(1)
  })

  test('rejects an invalid payload', async () => {
    const res = await forgot('not-an-email')
    expect(res.status).toBe(400)
  })
})

describe('reset-password', () => {
  test('replaces the password', async () => {
    const user = await createUser()
    const token = await grantToken(user.id)

    const res = await reset(token)
    expect(res.status).toBe(204)

    expect((await login(user.email)).status).toBe(401)
    expect((await login(user.email, NEW_PASSWORD)).status).toBe(200)
  })

  test('rejects a replayed token', async () => {
    const user = await createUser()
    const token = await grantToken(user.id)

    await reset(token)
    const replay = await reset(token)
    expect(replay.status).toBe(400)
  })

  test('rejects an unknown token', async () => {
    const res = await reset('never-issued')
    expect(res.status).toBe(400)
  })

  test('rejects a password shorter than 8 characters', async () => {
    const user = await createUser()
    const token = await grantToken(user.id)
    const res = await reset(token, 'short')
    expect(res.status).toBe(400)
    expect(res.body.issues).toBeArray()
  })

  test('revokes existing refresh tokens', async () => {
    const user = await createUser()
    const session = await login(user.email)
    const token = await grantToken(user.id)

    await reset(token)

    const after = await api('POST', '/mobile/auth/refresh', {
      body: { refreshToken: session.body.refreshToken },
    })
    expect(after.status).toBe(401)
  })
})

describe('change-password', () => {
  const change = async (
    headers: Record<string, string>,
    currentPassword: string,
    password = NEW_PASSWORD
  ) =>
    api('POST', '/mobile/auth/change-password', {
      headers,
      body: { currentPassword, password },
    })

  test('replaces the password and returns a fresh token pair', async () => {
    const user = await createUser()
    const res = await change(await bearer(user), TEST_PASSWORD)
    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeString()

    expect((await login(user.email)).status).toBe(401)
    expect((await login(user.email, NEW_PASSWORD)).status).toBe(200)
  })

  test('rejects a wrong current password without a 401', async () => {
    const user = await createUser()
    const res = await change(await bearer(user), 'wrong-password')
    expect(res.status).toBe(403)
  })

  test('invalidates a pending reset link', async () => {
    const user = await createUser()
    await forgot(user.email)
    await change(await bearer(user), TEST_PASSWORD)
    expect(await resetKeys()).toHaveLength(0)
  })

  test('requires a token', async () => {
    const res = await api('POST', '/mobile/auth/change-password', {
      body: { currentPassword: TEST_PASSWORD, password: NEW_PASSWORD },
    })
    expect(res.status).toBe(401)
  })

  test('rejects a password shorter than 8 characters', async () => {
    const user = await createUser()
    const res = await change(await bearer(user), TEST_PASSWORD, 'short')
    expect(res.status).toBe(400)
  })
})
