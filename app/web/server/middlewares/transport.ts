import type { MiddlewareHandler } from 'hono'
import type { AppEnv, Transport } from '../context'

export const withTransport =
  (transport: Transport): MiddlewareHandler<AppEnv> =>
  async (c, next) => {
    c.set('transport', transport)
    await next()
  }
