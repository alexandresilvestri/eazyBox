import { signAccessToken } from '../../jwt'
import type { User } from '@eazybox/shared'

export function tokenFor(
  user: Pick<User, 'id' | 'isAdmin' | 'isCoach'>,
  expiresIn = '5m'
) {
  return signAccessToken(
    { userId: user.id, isAdmin: user.isAdmin, isCoach: user.isCoach },
    expiresIn
  )
}

export const bearer = async (
  user: Pick<User, 'id' | 'isAdmin' | 'isCoach'>
) => ({ Authorization: `Bearer ${await tokenFor(user)}` })
