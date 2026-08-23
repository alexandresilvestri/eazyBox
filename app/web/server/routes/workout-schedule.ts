import { Hono } from 'hono'
import { workoutScheduleController } from '../controllers'
import { requireAdmin } from '../middlewares'
import type { AppEnv } from '../context'

export const workoutScheduleRoutes = new Hono<AppEnv>()

workoutScheduleRoutes.get('/', workoutScheduleController.list)
workoutScheduleRoutes.get('/:id', workoutScheduleController.findById)
workoutScheduleRoutes.post(
  '/',
  requireAdmin(),
  workoutScheduleController.create
)
workoutScheduleRoutes.patch(
  '/:id',
  requireAdmin(),
  workoutScheduleController.update
)
workoutScheduleRoutes.delete(
  '/:id',
  requireAdmin(),
  workoutScheduleController.remove
)
