import { RedisClient } from "bun";

export const redis = new RedisClient(process.env.REDIS_URL ?? "redis://localhost:6379");

const DEFAULT_TTL_SECONDS = 60;

export async function cached<T>(
  key: string,
  fallback: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<T> {
  const hit = await redis.get(key);
  if (hit !== null) {
    return JSON.parse(hit) as T;
  }

  const value = await fallback();
  await redis.set(key, JSON.stringify(value));
  await redis.expire(key, ttlSeconds);
  return value;
}

export async function invalidate(prefix: string): Promise<void> {
  const keys = await redis.keys(`${prefix}*`);
  if (keys.length > 0) {
    await Promise.all(keys.map((key) => redis.del(key)));
  }
}
