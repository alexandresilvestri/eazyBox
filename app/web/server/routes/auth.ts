import { Hono } from 'hono'
import { authController } from '../controllers'
import { authenticate, withRlsContext } from '../middlewares'
import type { AppEnv } from '../context'

export const authRoutes = new Hono<AppEnv>()

authRoutes.post('/login', authController.login)
authRoutes.post('/refresh', authController.refresh)
authRoutes.post('/logout', authController.logout)
authRoutes.get('/me', authenticate(), withRlsContext(), authController.me)
