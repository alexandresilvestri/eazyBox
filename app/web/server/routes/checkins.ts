import { Hono } from 'hono'
import { checkinsController } from '../controllers'
import type { AppEnv } from '../context'

export const checkinsRoutes = new Hono<AppEnv>()

checkinsRoutes.get('/', checkinsController.list)
checkinsRoutes.post('/', checkinsController.create)
checkinsRoutes.patch('/:id/undo', checkinsController.undo)
