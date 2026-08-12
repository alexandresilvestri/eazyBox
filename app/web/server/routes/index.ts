import { Hono } from 'hono'
import { usersRoutes } from './users'
import { redisReachable } from '../redis'

const routes = new Hono()

routes.get('/health', async (c) =>
  c.json({
    status: 'ok',
    redis: (await redisReachable()) ? 'ok' : 'unavailable',
  })
)

routes.route('/users', usersRoutes)

export default routes
