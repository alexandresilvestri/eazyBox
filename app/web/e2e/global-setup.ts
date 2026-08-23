import { spawnSync } from 'node:child_process'
import Knex from 'knex'
import { ADMIN, E2E_ADMIN_URL, E2E_DB_NAME, E2E_OWNER_URL } from './fixtures'

const MIGRATIONS_DIR = new URL('../server/db/migrations', import.meta.url)
  .pathname

const TABLES = [
  'checkins',
  'workout_sessions',
  'workout_schedule',
  'workouts',
  'users',
]

async function ensureDatabase() {
  const admin = Knex({ client: 'pg', connection: E2E_ADMIN_URL })
  const found = await admin.raw('select 1 from pg_database where datname = ?', [
    E2E_DB_NAME,
  ])
  if (found.rows.length === 0) {
    await admin.raw(`create database ${E2E_DB_NAME}`)
  }
  await admin.destroy()
}

async function migrateAndClean() {
  const owner = Knex({
    client: 'pg',
    connection: E2E_OWNER_URL,
    migrations: { directory: MIGRATIONS_DIR, extension: 'ts' },
  })
  await owner.migrate.latest()
  await owner.raw(`truncate ${TABLES.join(', ')} restart identity cascade`)
  await owner.destroy()
}

function seedAdmin() {
  const result = spawnSync('bun', ['server/scripts/create-admin.ts'], {
    cwd: new URL('..', import.meta.url).pathname,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
      ADMIN_EMAIL: ADMIN.email,
      ADMIN_PASSWORD: ADMIN.password,
      DATABASE_OWNER_URL: E2E_OWNER_URL,
    },
  })
  if (result.status !== 0) {
    throw new Error('failed to seed the e2e admin')
  }
}

export default async function globalSetup() {
  await ensureDatabase()
  await migrateAndClean()
  seedAdmin()
}
