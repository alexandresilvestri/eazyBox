import { Hono } from 'hono'
import { usersRoutes } from './users'
import { authenticate, withRlsContext } from '../middlewares'
import { redisReachable } from '../redis'
import type { AppEnv } from '../context'

const routes = new Hono<AppEnv>()

routes.get('/health', async (c) =>
  c.json({
    status: 'ok',
    redis: (await redisReachable()) ? 'ok' : 'unavailable',
  })
)

routes.use('/users/*', authenticate(), withRlsContext())
routes.use('/users', authenticate(), withRlsContext())
routes.route('/users', usersRoutes)

export default routes
