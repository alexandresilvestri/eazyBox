import { describe, expect, test } from 'bun:test'
import { app } from '../../app'

const ALLOWED = 'http://localhost:8081'
const BLOCKED = 'http://evil.example'

describe('cors', () => {
  test('answers a preflight from an allowed origin with no token', async () => {
    const res = await app.request('/api/users', {
      method: 'OPTIONS',
      headers: {
        Origin: ALLOWED,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type',
      },
    })

    expect(res.status).toBe(204)
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED)
    expect(res.headers.get('access-control-allow-headers')).toContain(
      'Authorization'
    )
  })

  test('exposes the allow-origin header to an allowed origin', async () => {
    const res = await app.request('/api/health', {
      headers: { Origin: ALLOWED },
    })

    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED)
  })

  test('sends no allow-origin header to an unlisted origin', async () => {
    const res = await app.request('/api/health', {
      headers: { Origin: BLOCKED },
    })

    expect(res.headers.get('access-control-allow-origin')).toBeNull()
  })

  test('never allows credentials cross-origin', async () => {
    const res = await app.request('/api/health', {
      headers: { Origin: ALLOWED },
    })

    expect(res.headers.get('access-control-allow-credentials')).toBeNull()
  })
})
