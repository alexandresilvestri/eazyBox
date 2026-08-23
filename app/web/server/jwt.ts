import { SignJWT, jwtVerify } from 'jose'

export const SESSION_COOKIE = 'session'
export const REFRESH_COOKIE = 'refresh'

export const ACCESS_TTL = '15m'
export const REFRESH_TTL = '30d'
export const ACCESS_TTL_SECONDS = 60 * 15
export const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 30

export type AccessClaims = {
  userId: string
  isAdmin: boolean
  isCoach: boolean
}

const secret = () => {
  const value = process.env.JWT_SECRET
  if (!value) {
    throw new Error('JWT_SECRET is not set')
  }
  return new TextEncoder().encode(value)
}

export const signAccessToken = (
  { userId, isAdmin, isCoach }: AccessClaims,
  expiresIn: string = ACCESS_TTL
) =>
  new SignJWT({ isAdmin, isCoach })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setExpirationTime(expiresIn)
    .sign(secret())

export const signRefreshToken = (userId: string, jti: string) =>
  new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setJti(jti)
    .setExpirationTime(REFRESH_TTL)
    .sign(secret())

export const verifyAccessToken = async (
  token: string
): Promise<AccessClaims> => {
  const { payload } = await jwtVerify(token, secret())
  return {
    userId: String(payload.sub),
    isAdmin: payload.isAdmin === true,
    isCoach: payload.isCoach === true,
  }
}

export const verifyRefreshToken = async (token: string) => {
  const { payload } = await jwtVerify(token, secret())
  return { userId: payload.sub, jti: payload.jti }
}
