import { Hono } from 'hono'
import { usersController } from '../controllers'
import { requireAdmin } from '../middlewares'
import type { AppEnv } from '../context'

export const usersRoutes = new Hono<AppEnv>()

usersRoutes.get('/', usersController.list)
usersRoutes.get('/:id', usersController.findById)
usersRoutes.post('/', requireAdmin(), usersController.create)
usersRoutes.patch('/:id', usersController.update)
usersRoutes.delete('/:id', requireAdmin(), usersController.remove)
