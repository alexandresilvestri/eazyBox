import { afterEach, describe, expect, mock, test } from 'bun:test'
import { apiFetch } from '../lib/api'

const realFetch = globalThis.fetch

type Call = { url: string; init: RequestInit }

const stub = (response: () => Response) => {
  const calls: Call[] = []
  globalThis.fetch = mock(async (url: unknown, init: RequestInit = {}) => {
    calls.push({ url: String(url), init })
    return response()
  }) as unknown as typeof fetch
  return calls
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status })

afterEach(() => {
  globalThis.fetch = realFetch
})

describe('apiFetch', () => {
  test('prefixes the path with /api and sends json by default', async () => {
    const calls = stub(() => json({ ok: true }))
    await apiFetch('/users')
    expect(calls[0]?.url).toBe('/api/users')
    expect(
      (calls[0]?.init.headers as Record<string, string>)['Content-Type']
    ).toBe('application/json')
  })

  test('returns the parsed body on success', async () => {
    stub(() => json([{ id: 'u1' }]))
    expect(await apiFetch<{ id: string }[]>('/users')).toEqual([{ id: 'u1' }])
  })

  test('returns undefined for a 204 without parsing a body', async () => {
    stub(() => new Response(null, { status: 204 }))
    expect(await apiFetch('/checkins/1/undo')).toBeUndefined()
  })

  test('throws the API message on an error status', async () => {
    stub(() => json({ error: 'Já existe um usuário com esse e-mail' }, 409))
    expect(apiFetch('/users')).rejects.toThrow(
      'Já existe um usuário com esse e-mail'
    )
  })

  test('falls back to a generic message when the body has none', async () => {
    stub(() => new Response('not json', { status: 500 }))
    expect(apiFetch('/users')).rejects.toThrow('Erro inesperado')
  })

  test('lets the caller override and extend the headers', async () => {
    const calls = stub(() => json({}))
    await apiFetch('/users', {
      method: 'POST',
      headers: { 'X-Trace': 'abc' },
    })
    const headers = calls[0]?.init.headers as Record<string, string>
    expect(headers['X-Trace']).toBe('abc')
    expect(headers['Content-Type']).toBe('application/json')
    expect(calls[0]?.init.method).toBe('POST')
  })
})
