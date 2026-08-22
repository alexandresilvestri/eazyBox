import { Hono } from 'hono'
import { workoutSessionsController } from '../controllers'
import { requireStaff } from '../middlewares'
import type { AppEnv } from '../context'

export const workoutSessionsRoutes = new Hono<AppEnv>()

workoutSessionsRoutes.get('/', workoutSessionsController.list)
workoutSessionsRoutes.get('/:id', workoutSessionsController.findById)
workoutSessionsRoutes.post('/', requireStaff(), workoutSessionsController.create)
workoutSessionsRoutes.patch(
  '/:id',
  requireStaff(),
  workoutSessionsController.update
)
workoutSessionsRoutes.delete(
  '/:id',
  requireStaff(),
  workoutSessionsController.remove
)
