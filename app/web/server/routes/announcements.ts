import { Hono } from 'hono'
import { announcementsController } from '../controllers'
import { requireStaff } from '../middlewares'
import type { AppEnv } from '../context'

export const announcementsRoutes = new Hono<AppEnv>()

announcementsRoutes.get('/', announcementsController.list)
announcementsRoutes.post('/', requireStaff(), announcementsController.create)
announcementsRoutes.patch(
  '/:id',
  requireStaff(),
  announcementsController.update
)
announcementsRoutes.delete(
  '/:id',
  requireStaff(),
  announcementsController.remove
)
