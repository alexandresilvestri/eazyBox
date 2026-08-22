import type { Knex } from 'knex'

const ownerConnection =
  process.env.DATABASE_OWNER_URL ??
  `postgres://${process.env.DB_USER ?? 'postgres'}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? 5432}/${process.env.DB_NAME ?? 'eazybox'}`

const baseConfig: Knex.Config = {
  client: 'pg',
  migrations: {
    directory: './migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './seeds',
    extension: 'ts',
  },
}

const config: Record<string, Knex.Config> = {
  development: {
    ...baseConfig,
    connection: ownerConnection,
    pool: { min: 1, max: 10 },
  },
  test: {
    ...baseConfig,
    connection:
      process.env.DATABASE_TEST_URL ??
      'postgres://postgres@localhost:5432/eazybox_test',
    pool: { min: 1, max: 5 },
  },
  production: {
    ...baseConfig,
    connection: ownerConnection,
    pool: { min: 2, max: 20 },
  },
}

export default config
