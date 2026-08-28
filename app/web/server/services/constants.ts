export const UNIQUE_VIOLATION = '23505'
export const INSUFFICIENT_PRIVILEGE = '42501'
export const LIST_TTL_SECONDS = 30

export const CACHE_PREFIX = {
  workouts: 'workouts:',
  workoutSchedule: 'workout-schedule:',
  workoutSessions: 'workout-sessions:',
  announcements: 'announcements:',
} as const

export const CACHE_PREFIXES = Object.values(CACHE_PREFIX)

export const isUniqueViolation = (err: unknown) =>
  (err as { code?: string } | null)?.code === UNIQUE_VIOLATION

export const isInsufficientPrivilege = (err: unknown) =>
  (err as { code?: string } | null)?.code === INSUFFICIENT_PRIVILEGE
