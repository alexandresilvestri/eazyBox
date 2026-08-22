import type { MiddlewareHandler } from 'hono'
import { buildModels, transaction } from '../models'
import { buildServices } from '../services'
import type { AppEnv } from '../context'

const SET_SESSION_IDENTITY = `
  select
    set_config('app.user_id', ?, true),
    set_config('app.is_admin', ?, true),
    set_config('app.is_coach', ?, true)
`

export const withRlsContext = (): MiddlewareHandler<AppEnv> => async (c, next) => {
  const { userId, isAdmin, isCoach } = c.get('auth')

  await transaction(async (trx) => {
    await trx.raw(SET_SESSION_IDENTITY, [
      userId,
      String(isAdmin),
      String(isCoach),
    ])
    c.set('services', buildServices(buildModels(trx)))
    await next()
  })
}
