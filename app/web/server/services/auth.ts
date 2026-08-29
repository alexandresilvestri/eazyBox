import { invalidate, redis } from '../redis'
import { sendPasswordReset } from '../mail'
import { Sentry } from '../sentry'
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
  InvalidResetToken,
  WrongPassword,
} from '../errors'
import type { AuthModel, IdentityRow } from '../models/auth'
import type { LoginInput } from '@eazybox/shared'

const REFRESH_PREFIX = 'refresh:'
const RESET_PREFIX = 'password-reset:'
const RESET_USER_PREFIX = 'password-reset-user:'
const THROTTLE_PREFIX = 'password-reset-throttle:'
const RESET_TTL_SECONDS = 60 * 30
const THROTTLE_TTL_SECONDS = 60
const TOKEN_BYTES = 32

const refreshKey = (userId: string, jti: string) =>
  `${REFRESH_PREFIX}${userId}:${jti}`

const resetKey = (token: string) =>
  `${RESET_PREFIX}${new Bun.CryptoHasher('sha256').update(token).digest('hex')}`

const newToken = () =>
  Buffer.from(crypto.getRandomValues(new Uint8Array(TOKEN_BYTES))).toString(
    'base64url'
  )

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
      refreshKey(identity.id, jti),
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

    const key = refreshKey(subject, jti)
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

  private async discardReset(userId: string) {
    const indexKey = `${RESET_USER_PREFIX}${userId}`
    const pending = await redis.get(indexKey)
    if (pending) {
      await redis.del(pending)
      await redis.del(indexKey)
    }
  }

  private async applyPassword(userId: string, password: string) {
    const updated = await this.auth.setPassword(
      userId,
      await Bun.password.hash(password)
    )
    await invalidate(`${REFRESH_PREFIX}${userId}:`)
    await this.discardReset(userId)
    return updated
  }

  async forgotPassword(email: string) {
    const row = await this.auth.findLogin(email)
    if (!row?.isActive) {
      return
    }

    const fresh = await redis.send('SET', [
      `${THROTTLE_PREFIX}${row.id}`,
      '1',
      'NX',
      'EX',
      String(THROTTLE_TTL_SECONDS),
    ])
    if (fresh === null) {
      return
    }

    await this.discardReset(row.id)
    const token = newToken()
    const key = resetKey(token)
    await redis.set(key, row.id, 'EX', RESET_TTL_SECONDS)
    await redis.set(
      `${RESET_USER_PREFIX}${row.id}`,
      key,
      'EX',
      RESET_TTL_SECONDS
    )

    await sendPasswordReset(email, token).catch((err) => {
      console.error('Password reset email failed. Check the logs.', err)
      Sentry.captureException(err)
    })
  }

  async resetPassword(token: string, password: string) {
    const key = resetKey(token)
    const userId = await redis.get(key)
    if (!userId) {
      throw new InvalidResetToken()
    }
    await redis.del(key)
    if (!(await this.applyPassword(userId, password))) {
      throw new InvalidResetToken()
    }
  }

  async changePassword(
    email: string,
    currentPassword: string,
    password: string
  ) {
    const row = await this.auth.findLogin(email)
    if (!row) {
      throw new WrongPassword()
    }
    if (!(await Bun.password.verify(currentPassword, row.password))) {
      throw new WrongPassword()
    }

    await this.applyPassword(row.id, password)

    const { password: _password, ...identity } = row
    return this.issue(identity)
  }
}
