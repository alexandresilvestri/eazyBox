import { afterEach, describe, expect, spyOn, test } from 'bun:test'
import { api } from '../helpers/request'
import { redis } from '../../redis'

const probes: { mockRestore: () => void }[] = []

const stubPing = (implementation: () => Promise<unknown>) => {
  const spy = spyOn(redis, 'ping').mockImplementation(
    implementation as typeof redis.ping
  )
  probes.push(spy)
  return spy
}

afterEach(() => {
  while (probes.length > 0) {
    probes.pop()?.mockRestore()
  }
})

describe('health', () => {
  test('needs no token and reports redis as ok when it answers', async () => {
    const res = await api('GET', '/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok', redis: 'ok' })
  })

  test('reports redis as unavailable when the probe rejects', async () => {
    stubPing(() => Promise.reject(new Error('ECONNREFUSED')))
    const res = await api('GET', '/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok', redis: 'unavailable' })
  })

  test('stays up and reports unavailable when the probe hangs past the timeout', async () => {
    stubPing(() => new Promise(() => {}))
    const res = await api('GET', '/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.redis).toBe('unavailable')
  })

  test('recovers once redis answers again', async () => {
    stubPing(() => Promise.reject(new Error('ECONNREFUSED')))
    expect((await api('GET', '/health')).body.redis).toBe('unavailable')
    probes.pop()?.mockRestore()
    expect((await api('GET', '/health')).body.redis).toBe('ok')
  })
})
