import Knex from 'knex'
import { redis } from '../../redis'
import { OWNER_ADMIN_URL, TEST_DB_NAME } from './env'

const MIGRATIONS_DIR = new URL('../../db/migrations', import.meta.url).pathname

export const TABLES = [
  'announcements',
  'checkins',
  'workout_sessions',
  'workout_schedule',
  'workouts',
  'users',
]

export const owner = Knex({
  client: 'pg',
  connection: process.env.DATABASE_TEST_URL,
  migrations: { directory: MIGRATIONS_DIR, extension: 'ts' },
  pool: { min: 1, max: 5 },
})

export async function createTestDatabase() {
  const admin = Knex({ client: 'pg', connection: OWNER_ADMIN_URL })
  const found = await admin.raw('select 1 from pg_database where datname = ?', [
    TEST_DB_NAME,
  ])
  if (found.rows.length === 0) {
    await admin.raw(`create database ${TEST_DB_NAME}`)
  }
  await admin.destroy()
}

export function truncateAll() {
  return owner.raw(`truncate ${TABLES.join(', ')} restart identity cascade`)
}

export function clearCache() {
  return redis.send('FLUSHDB', [])
}
