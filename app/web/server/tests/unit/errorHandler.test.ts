import { describe, expect, spyOn, test } from 'bun:test'
import { Hono } from 'hono'
import { errorHandler } from '../../middlewares'
import { Sentry } from '../../sentry'

const throwing = (err: Error) => {
  const instance = new Hono()
  instance.get('/boom', () => {
    throw err
  })
  instance.onError(errorHandler)
  return instance
}

describe('errorHandler', () => {
  test('turns an unmapped throw into a generic 500', async () => {
    const res = await throwing(new Error('boom')).request('/boom')
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Erro interno do servidor' })
  })

  test('leaks neither the message nor the stack of the thrown error', async () => {
    const res = await throwing(
      new Error('connect postgres://app_user:hunter2@db:5432/eazybox failed')
    ).request('/boom')
    const body = await res.text()
    expect(body).not.toContain('hunter2')
    expect(body).not.toContain('postgres://')
    expect(body).not.toContain('at ')
  })

  test('reports the error to Sentry', async () => {
    const captured = spyOn(Sentry, 'captureException')
    const err = new Error('boom')
    await throwing(err).request('/boom')
    expect(captured).toHaveBeenCalledWith(err)
    captured.mockRestore()
  })
})
