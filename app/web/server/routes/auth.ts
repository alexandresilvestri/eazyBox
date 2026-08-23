import { Hono } from 'hono'
import { authController } from '../controllers'
import { authenticate, withRlsContext, withTransport } from '../middlewares'
import type { AppEnv, Transport } from '../context'

export const createAuthRoutes = (transport: Transport) => {
  const authRoutes = new Hono<AppEnv>()

  authRoutes.use('*', withTransport(transport))

  authRoutes.post('/login', authController.login)
  authRoutes.post('/refresh', authController.refresh)
  authRoutes.post('/logout', authController.logout)
  authRoutes.get('/me', authenticate(), withRlsContext(), authController.me)

  return authRoutes
}
