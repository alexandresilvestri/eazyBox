import Knex from 'knex'
import knexfile from './knexfile'
import { config as knexConfig } from './knex.config.js'

const environment = process.env.NODE_ENV ?? 'development'
const config = knexfile[environment]

const connection = process.env.DATABASE_URL
if (!connection) {
  throw new Error('DATABASE_URL is not set')
}

export const db = Knex({ ...config, ...knexConfig, connection })
