import type { Context } from 'hono'
import { Sentry } from '../sentry'

export const errorHandler = (err: Error, c: Context) => {
  Sentry.captureException(err)
  return c.json({ error: 'Erro interno do servidor' }, 500)
}
