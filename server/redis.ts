import { RedisClient } from "bun";

/**
 * Cliente Redis nativo do Bun (bun:redis), sem dependência externa
 * como ioredis. Suporta RESP2/RESP3, pipelining automático e
 * reconexão automática.
 */
export const redis = new RedisClient(process.env.REDIS_URL ?? "redis://localhost:6379");

redis.onconnect = () => {
  console.log("Redis conectado");
};

redis.onclose = (err) => {
  console.error("Conexão com o Redis encerrada", err);
};

const DEFAULT_TTL_SECONDS = 60;

/**
 * Busca um valor em cache já desserializado, ou executa `fallback`,
 * armazena o resultado em cache e o retorna.
 */
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

/**
 * Remove todas as chaves que casam com um prefixo (ex.: "users:*").
 */
export async function invalidate(prefix: string): Promise<void> {
  const keys = await redis.keys(`${prefix}*`);
  if (keys.length > 0) {
    await Promise.all(keys.map((key) => redis.del(key)));
  }
}
