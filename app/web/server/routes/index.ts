import { Hono } from 'hono'
import { createAuthRoutes } from './auth'
import { checkinsRoutes } from './checkins'
import { usersRoutes } from './users'
import { workoutScheduleRoutes } from './workout-schedule'
import { workoutSessionsRoutes } from './workout-sessions'
import { workoutsRoutes } from './workouts'
import { authenticate, withRlsContext } from '../middlewares'
import { redisReachable } from '../redis'
import type { AppEnv } from '../context'

const PROTECTED = [
  ['/users', usersRoutes],
  ['/workouts', workoutsRoutes],
  ['/workout-schedule', workoutScheduleRoutes],
  ['/workout-sessions', workoutSessionsRoutes],
  ['/checkins', checkinsRoutes],
] as const

const routes = new Hono<AppEnv>()

routes.get('/health', async (c) =>
  c.json({
    status: 'ok',
    redis: (await redisReachable()) ? 'ok' : 'unavailable',
  })
)

routes.route('/auth', createAuthRoutes('cookie'))
routes.route('/mobile/auth', createAuthRoutes('token'))

const guarded = new Hono<AppEnv>()
guarded.use('*', authenticate(), withRlsContext())
for (const [path, router] of PROTECTED) {
  guarded.route(path, router)
}
routes.route('/', guarded)

export default routes
