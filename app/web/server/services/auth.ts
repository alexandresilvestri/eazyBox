import { redis } from '../redis'
import {
  REFRESH_TTL_SECONDS,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../jwt'
import {
  InactiveUser,
  InvalidCredentials,
  InvalidRefreshToken,
} from '../errors'
import type { AuthModel, IdentityRow } from '../models/auth'
import type { LoginInput } from '@eazybox/shared'

const REFRESH_PREFIX = 'refresh:'

export class AuthService {
  constructor(private readonly auth: AuthModel) {}

  private async issue(identity: IdentityRow) {
    const jti = crypto.randomUUID()

    const accessToken = await signAccessToken({
      userId: identity.id,
      isAdmin: identity.isAdmin,
      isCoach: identity.isCoach,
    })

    const refreshToken = await signRefreshToken(identity.id, jti)

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
      const verified = await verifyRefreshToken(refreshToken)
      jti = verified.jti
      subject = verified.userId
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
