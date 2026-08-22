export const UNIQUE_VIOLATION = '23505'
export const LIST_TTL_SECONDS = 30

export const isUniqueViolation = (err: unknown) =>
  (err as { code?: string } | null)?.code === UNIQUE_VIOLATION
