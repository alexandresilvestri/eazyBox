import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import type { Context } from 'hono'
import { loginSchema, refreshSchema } from '@eazybox/shared'
import { authService } from '../services'
import {
  InactiveUser,
  InvalidCredentials,
  InvalidRefreshToken,
} from '../errors'
import {
  ACCESS_TTL_SECONDS,
  REFRESH_COOKIE,
  REFRESH_TTL_SECONDS,
  SESSION_COOKIE,
} from '../jwt'
import { INVALID_PAYLOAD } from './messages'
import type { AppEnv } from '../context'

type Tokens = { accessToken: string; refreshToken: string }

const respondWithTokens = (c: Context<AppEnv>, tokens: Tokens) => {
  if (c.get('transport') === 'token') {
    return c.json(tokens)
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
  } as const

  setCookie(c, SESSION_COOKIE, tokens.accessToken, {
    ...options,
    maxAge: ACCESS_TTL_SECONDS,
  })
  setCookie(c, REFRESH_COOKIE, tokens.refreshToken, {
    ...options,
    maxAge: REFRESH_TTL_SECONDS,
  })
  return c.json({ ok: true })
}

export const login = async (c: Context<AppEnv>) => {
  const parsed = loginSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) {
    return c.json({ error: INVALID_PAYLOAD, issues: parsed.error.issues }, 400)
  }

  try {
    return respondWithTokens(c, await authService.login(parsed.data))
  } catch (err) {
    if (err instanceof InvalidCredentials) {
      return c.json({ error: 'E-mail ou senha inválidos' }, 401)
    }
    if (err instanceof InactiveUser) {
      return c.json({ error: 'Conta desativada' }, 403)
    }
    throw err
  }
}

const readRefreshToken = async (c: Context<AppEnv>) => {
  if (c.get('transport') === 'cookie') {
    return getCookie(c, REFRESH_COOKIE)
  }
  const parsed = refreshSchema.safeParse(
    await c.req.json().catch(() => null)
  )
  return parsed.success ? parsed.data.refreshToken : undefined
}

export const refresh = async (c: Context<AppEnv>) => {
  const token = await readRefreshToken(c)
  if (!token) {
    return c.json({ error: 'Refresh token ausente' }, 401)
  }

  try {
    return respondWithTokens(c, await authService.refresh(token))
  } catch (err) {
    if (err instanceof InvalidRefreshToken) {
      return c.json({ error: 'Sessão inválida ou expirada' }, 401)
    }
    if (err instanceof InactiveUser) {
      return c.json({ error: 'Conta desativada' }, 403)
    }
    throw err
  }
}

export const logout = async (c: Context<AppEnv>) => {
  const token = await readRefreshToken(c)
  if (token) {
    await authService.logout(token)
  }
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  deleteCookie(c, REFRESH_COOKIE, { path: '/' })
  return c.body(null, 204)
}

export const me = async (c: Context<AppEnv>) =>
  c.json(await c.get('services').users.findById(c.get('auth').userId))
