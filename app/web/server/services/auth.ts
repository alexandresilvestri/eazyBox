import { SignJWT, jwtVerify } from 'jose'
import { redis } from '../redis'
import {
  InactiveUser,
  InvalidCredentials,
  InvalidRefreshToken,
} from '../errors'
import type { AuthModel, IdentityRow } from '../models/auth'
import type { LoginInput } from '@eazybox/shared'

const ACCESS_TTL = '15m'
const REFRESH_TTL = '30d'
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30
const REFRESH_PREFIX = 'refresh:'

const secret = () => {
  const value = process.env.JWT_SECRET
  if (!value) {
    throw new Error('JWT_SECRET is not set')
  }
  return new TextEncoder().encode(value)
}

export class AuthService {
  constructor(private readonly auth: AuthModel) {}

  private async issue(identity: IdentityRow) {
    const jti = crypto.randomUUID()

    const accessToken = await new SignJWT({
      isAdmin: identity.isAdmin,
      isCoach: identity.isCoach,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(identity.id)
      .setExpirationTime(ACCESS_TTL)
      .sign(secret())

    const refreshToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(identity.id)
      .setJti(jti)
      .setExpirationTime(REFRESH_TTL)
      .sign(secret())

    await redis.set(
      `${REFRESH_PREFIX}${jti}`,
      identity.id,
      'EX',
      REFRESH_TTL_SECONDS
    )

    return { accessToken, refreshToken }
  }

  async login({ email, password }: LoginInput) {
    const row = await this.auth.findLogin(email)
    if (!row) {
      throw new InvalidCredentials()
    }
    if (!(await Bun.password.verify(password, row.password))) {
      throw new InvalidCredentials()
    }
    if (!row.isActive) {
      throw new InactiveUser()
    }

    const { password: _password, ...identity } = row
    return this.issue(identity)
  }

  private async consume(refreshToken: string) {
    let jti: string | undefined
    let subject: string | undefined
    try {
      const { payload } = await jwtVerify(refreshToken, secret())
      jti = payload.jti
      subject = payload.sub
    } catch {
      throw new InvalidRefreshToken()
    }

    if (!jti || !subject) {
      throw new InvalidRefreshToken()
    }

    const key = `${REFRESH_PREFIX}${jti}`
    const stored = await redis.get(key)
    if (stored !== subject) {
      throw new InvalidRefreshToken()
    }
    await redis.del(key)

    return subject
  }

  async refresh(refreshToken: string) {
    const userId = await this.consume(refreshToken)
    const identity = await this.auth.findIdentity(userId)
    if (!identity) {
      throw new InvalidRefreshToken()
    }
    if (!identity.isActive) {
      throw new InactiveUser()
    }
    return this.issue(identity)
  }

  async logout(refreshToken: string) {
    await this.consume(refreshToken).catch(() => undefined)
  }
}
