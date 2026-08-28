import Knex from 'knex'
import knexfile from '../db/knexfile'
import { config as knexConfig } from '../db/knex.config'
import { SEED_PASSWORD } from '../db/seeds/01_users'
import { invalidate, redis } from '../redis'
import { CACHE_PREFIXES } from '../services/constants'

const environment = process.env.NODE_ENV ?? 'development'

if (environment === 'production') {
  console.error('seed is not allowed in production')
  process.exit(1)
}

const owner = Knex({ ...knexfile[environment], ...knexConfig })

await owner.raw(
  'truncate announcements, checkins, workout_sessions, workout_schedule, workouts, users restart identity cascade'
)

await owner.seed.run({
  directory: new URL('../db/seeds', import.meta.url).pathname,
})

await Promise.all(CACHE_PREFIXES.map((prefix) => invalidate(prefix)))

const [admin] = await owner('users').select('email').where({ isAdmin: true })

console.log(`seed ready: ${admin.email} / ${SEED_PASSWORD}`)

redis.close()
await owner.destroy()
