import { describe, expect, test } from 'bun:test'
import { app } from '../../app'
import { createUser, TEST_PASSWORD } from '../helpers/factories'
import { api } from '../helpers/request'

const request = (
  method: string,
  path: string,
  { body, cookie }: { body?: unknown; cookie?: string } = {}
) =>
  app.request(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie === undefined ? {} : { Cookie: cookie }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })

const jar = (res: Response) =>
  res.headers
    .getSetCookie()
    .map((cookie) => cookie.split(';')[0])
    .join('; ')

const cookieFor = async (email: string) =>
  jar(
    await request('POST', '/auth/login', {
      body: { email, password: TEST_PASSWORD },
    })
  )

const valueOf = (cookies: string, name: string) =>
  cookies
    .split('; ')
    .find((pair) => pair.startsWith(`${name}=`))
    ?.slice(name.length + 1)

describe('cookie login', () => {
  test('sets an httpOnly session and refresh cookie', async () => {
    const user = await createUser()
    const res = await request('POST', '/auth/login', {
      body: { email: user.email, password: TEST_PASSWORD },
    })
    expect(res.status).toBe(200)

    const cookies = res.headers.getSetCookie()
    expect(cookies.some((cookie) => cookie.startsWith('session='))).toBe(true)
    expect(cookies.some((cookie) => cookie.startsWith('refresh='))).toBe(true)
    for (const cookie of cookies) {
      expect(cookie).toContain('HttpOnly')
      expect(cookie).toContain('SameSite=Lax')
    }
  })

  test('answers with a flag rather than the tokens themselves', async () => {
    const user = await createUser()
    const res = await request('POST', '/auth/login', {
      body: { email: user.email, password: TEST_PASSWORD },
    })
    expect(await res.json()).toEqual({ ok: true })
  })

  test('sets no cookie for a wrong password', async () => {
    const user = await createUser()
    const res = await request('POST', '/auth/login', {
      body: { email: user.email, password: 'wrong-password' },
    })
    expect(res.status).toBe(401)
    expect(res.headers.getSetCookie()).toHaveLength(0)
  })
})

describe('cookie refresh', () => {
  test('rotates the pair from the refresh cookie alone', async () => {
    const user = await createUser()
    const cookies = await cookieFor(user.email)

    const res = await request('POST', '/auth/refresh', { cookie: cookies })
    expect(res.status).toBe(200)

    const rotated = jar(res)
    expect(valueOf(rotated, 'refresh')).not.toBe(valueOf(cookies, 'refresh'))
    expect(valueOf(rotated, 'session')).toBeTruthy()
  })

  test('the rotated session cookie is accepted by a guarded route', async () => {
    const user = await createUser()
    const rotated = jar(
      await request('POST', '/auth/refresh', {
        cookie: await cookieFor(user.email),
      })
    )
    const res = await request('GET', '/auth/me', { cookie: rotated })
    expect(res.status).toBe(200)
  })

  test('rejects a replayed refresh cookie', async () => {
    const user = await createUser()
    const cookies = await cookieFor(user.email)

    expect(
      (await request('POST', '/auth/refresh', { cookie: cookies })).status
    ).toBe(200)
    expect(
      (await request('POST', '/auth/refresh', { cookie: cookies })).status
    ).toBe(401)
  })

  test('rejects a request carrying no cookie at all', async () => {
    const res = await request('POST', '/auth/refresh')
    expect(res.status).toBe(401)
  })

  test('ignores a refresh token offered in the body on the cookie mount', async () => {
    const user = await createUser()
    const cookies = await cookieFor(user.email)
    const res = await request('POST', '/auth/refresh', {
      body: { refreshToken: valueOf(cookies, 'refresh') },
    })
    expect(res.status).toBe(401)
  })
})

describe('cookie logout', () => {
  test('clears both cookies and revokes the refresh token', async () => {
    const user = await createUser()
    const cookies = await cookieFor(user.email)

    const out = await request('POST', '/auth/logout', { cookie: cookies })
    expect(out.status).toBe(204)
    for (const cookie of out.headers.getSetCookie()) {
      expect(cookie).toContain('Max-Age=0')
    }

    const after = await request('POST', '/auth/refresh', { cookie: cookies })
    expect(after.status).toBe(401)
  })

  test('is idempotent with no cookie present', async () => {
    expect((await request('POST', '/auth/logout')).status).toBe(204)
  })
})

describe('cookie change-password', () => {
  test('re-issues cookies instead of returning tokens', async () => {
    const user = await createUser()
    const cookies = await cookieFor(user.email)

    const res = await request('POST', '/auth/change-password', {
      cookie: cookies,
      body: { currentPassword: TEST_PASSWORD, password: 'a-brand-new-one' },
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(jar(res)).toContain('session=')

    const relogin = await api('POST', '/mobile/auth/login', {
      body: { email: user.email, password: 'a-brand-new-one' },
    })
    expect(relogin.status).toBe(200)
  })

  test('requires a session cookie', async () => {
    const res = await request('POST', '/auth/change-password', {
      body: { currentPassword: TEST_PASSWORD, password: 'a-brand-new-one' },
    })
    expect(res.status).toBe(401)
  })
})
