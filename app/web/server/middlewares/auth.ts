import { getCookie } from 'hono/cookie'
import type { Context, MiddlewareHandler } from 'hono'
import { SESSION_COOKIE, verifyAccessToken } from '../jwt'
import type { AppEnv } from '../context'

const BEARER_PREFIX = 'Bearer '

const readToken = (c: Context<AppEnv>) => {
  const header = c.req.header('Authorization')
  if (header?.startsWith(BEARER_PREFIX)) {
    return header.slice(BEARER_PREFIX.length)
  }
  return getCookie(c, SESSION_COOKIE)
}

export const authenticate =
  (): MiddlewareHandler<AppEnv> => async (c, next) => {
    const token = readToken(c)
    if (!token) {
      return c.json({ error: 'Não autenticado' }, 401)
    }

    try {
      c.set('auth', await verifyAccessToken(token))
    } catch {
      return c.json({ error: 'Sessão inválida ou expirada' }, 401)
    }

    await next()
  }

export const requireAdmin =
  (): MiddlewareHandler<AppEnv> => async (c, next) => {
    if (!c.get('auth').isAdmin) {
      return c.json({ error: 'Acesso restrito a administradores' }, 403)
    }
    await next()
  }

export const requireStaff =
  (): MiddlewareHandler<AppEnv> => async (c, next) => {
    const { isAdmin, isCoach } = c.get('auth')
    if (!isAdmin && !isCoach) {
      return c.json({ error: 'Acesso restrito à equipe' }, 403)
    }
    await next()
  }
