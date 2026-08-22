import Knex from 'knex'
import knexfile from '../db/knexfile'
import { config as knexConfig } from '../db/knex.config.js'

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

if (!email || !password) {
  console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set')
  process.exit(1)
}

const environment = process.env.NODE_ENV ?? 'development'
const owner = Knex({ ...knexfile[environment], ...knexConfig })

const [user] = await owner('users')
  .insert({
    email,
    password: await Bun.password.hash(password),
    firstName: 'Admin',
    lastName: 'EazyBox',
    isAdmin: true,
    isActive: true,
  })
  .onConflict('email')
  .merge({ isAdmin: true, isActive: true, deletedAt: null })
  .returning(['id', 'email'])

console.log(`admin ready: ${user.email} (${user.id})`)
await owner.destroy()
