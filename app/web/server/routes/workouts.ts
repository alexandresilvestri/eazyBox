import { Hono } from 'hono'
import { workoutsController } from '../controllers'
import { requireStaff } from '../middlewares'
import type { AppEnv } from '../context'

export const workoutsRoutes = new Hono<AppEnv>()

workoutsRoutes.get('/', workoutsController.list)
workoutsRoutes.get('/:id', workoutsController.findById)
workoutsRoutes.post('/', requireStaff(), workoutsController.create)
workoutsRoutes.patch('/:id', requireStaff(), workoutsController.update)
workoutsRoutes.delete('/:id', requireStaff(), workoutsController.remove)
