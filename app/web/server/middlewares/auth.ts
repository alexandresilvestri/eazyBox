import { jwtVerify } from 'jose'
import { getCookie } from 'hono/cookie'
import type { MiddlewareHandler } from 'hono'
import type { AppEnv, AuthContext } from '../context'

const SESSION_COOKIE = 'session'
const BEARER_PREFIX = 'Bearer '

const secret = () => {
  const value = process.env.JWT_SECRET
  if (!value) {
    throw new Error('JWT_SECRET is not set')
  }
  return new TextEncoder().encode(value)
}

const readToken = (c: Parameters<MiddlewareHandler<AppEnv>>[0]) => {
  const header = c.req.header('Authorization')
  if (header?.startsWith(BEARER_PREFIX)) {
    return header.slice(BEARER_PREFIX.length)
  }
  return getCookie(c, SESSION_COOKIE)
}

export const authenticate = (): MiddlewareHandler<AppEnv> => async (c, next) => {
  const token = readToken(c)
  if (!token) {
    return c.json({ error: 'Não autenticado' }, 401)
  }

  try {
    const { payload } = await jwtVerify(token, secret())
    c.set('auth', {
      userId: String(payload.sub),
      isAdmin: payload.isAdmin === true,
      isCoach: payload.isCoach === true,
    } satisfies AuthContext)
  } catch {
    return c.json({ error: 'Sessão inválida ou expirada' }, 401)
  }

  await next()
}

export const requireAdmin = (): MiddlewareHandler<AppEnv> => async (c, next) => {
  if (!c.get('auth').isAdmin) {
    return c.json({ error: 'Acesso restrito a administradores' }, 403)
  }
  await next()
}

export const requireStaff = (): MiddlewareHandler<AppEnv> => async (c, next) => {
  const { isAdmin, isCoach } = c.get('auth')
  if (!isAdmin && !isCoach) {
    return c.json({ error: 'Acesso restrito à equipe' }, 403)
  }
  await next()
}
