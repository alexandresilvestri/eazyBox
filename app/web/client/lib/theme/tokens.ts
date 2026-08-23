import type { Tone } from '@/components/ui/badge'
import type { User } from '@eazybox/shared'

export const roleOf = (
  user: Pick<User, 'isAdmin' | 'isCoach'>
): { label: string; tone: Tone } => {
  if (user.isAdmin) return { label: 'Admin', tone: 'accent' }
  if (user.isCoach) return { label: 'Coach', tone: 'ok' }
  return { label: 'Aluno', tone: 'neutral' }
}
