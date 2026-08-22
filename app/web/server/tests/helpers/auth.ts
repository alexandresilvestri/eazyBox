import { SignJWT } from 'jose'
import type { User } from '@eazybox/shared'

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET)

export function tokenFor(
  user: Pick<User, 'id' | 'isAdmin' | 'isCoach'>,
  expiresIn = '5m'
) {
  return new SignJWT({ isAdmin: user.isAdmin, isCoach: user.isCoach })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setExpirationTime(expiresIn)
    .sign(secret())
}

export const bearer = async (
  user: Pick<User, 'id' | 'isAdmin' | 'isCoach'>
) => ({ Authorization: `Bearer ${await tokenFor(user)}` })
