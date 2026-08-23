export const UNIQUE_VIOLATION = '23505'
export const LIST_TTL_SECONDS = 30

export const CACHE_PREFIX = {
  workouts: 'workouts:',
  workoutSchedule: 'workout-schedule:',
  workoutSessions: 'workout-sessions:',
} as const

export const CACHE_PREFIXES = Object.values(CACHE_PREFIX)

export const isUniqueViolation = (err: unknown) =>
  (err as { code?: string } | null)?.code === UNIQUE_VIOLATION
