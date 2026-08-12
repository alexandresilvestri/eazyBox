import { RedisClient } from 'bun'

export const redis = new RedisClient(
  process.env.REDIS_URL ?? 'redis://localhost:6379'
)

const DEFAULT_TTL_SECONDS = 60
const HEALTH_PROBE_TIMEOUT_MS = 500

async function safeRedis<T>(
  operation: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  try {
    return await operation()
  } catch (err) {
    console.error('Redis operation failed. Check the logs.', err)
    return fallbackValue
  }
}

export function redisReachable(): Promise<boolean> {
  return safeRedis(
    () =>
      Promise.race([
        redis.ping().then(() => true),
        Bun.sleep(HEALTH_PROBE_TIMEOUT_MS).then(() => false),
      ]),
    false
  )
}

export async function cached<T>(
  key: string,
  fallback: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<T> {
  const hit = await safeRedis(() => redis.get(key), null)
  if (hit !== null) {
    return JSON.parse(hit) as T
  }

  const value = await fallback()
  if (value !== undefined) {
    await safeRedis(
      () => redis.set(key, JSON.stringify(value), 'EX', ttlSeconds),
      null
    )
  }
  return value
}

export async function invalidate(prefix: string): Promise<void> {
  const keys = await safeRedis(() => redis.keys(`${prefix}*`), [])
  if (keys.length > 0) {
    await safeRedis(() => Promise.all(keys.map((key) => redis.del(key))), [])
  }
}
