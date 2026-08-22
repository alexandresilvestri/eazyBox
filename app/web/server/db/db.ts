import Knex from 'knex'
import knexfile from './knexfile'
import { config as knexConfig } from './knex.config.js'

const environment = process.env.NODE_ENV ?? 'development'
const config = knexfile[environment]

const APP_CONNECTION =
  process.env.DATABASE_URL ?? 'postgres://app_user@localhost:5432/eazybox'

export const db = Knex({
  ...config,
  ...knexConfig,
  connection: APP_CONNECTION,
})
