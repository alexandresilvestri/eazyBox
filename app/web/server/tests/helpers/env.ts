process.env.NODE_ENV = 'test'
process.env.DATABASE_TEST_URL ??=
  'postgres://postgres@localhost:5432/eazybox_test'
process.env.DATABASE_URL ??= 'postgres://app_user@localhost:5432/eazybox_test'
process.env.REDIS_URL ??= 'redis://localhost:6379/1'
process.env.JWT_SECRET ??= 'test-secret'

export const OWNER_ADMIN_URL =
  process.env.DATABASE_TEST_ADMIN_URL ??
  'postgres://postgres@localhost:5432/postgres'

export const TEST_DB_NAME = new URL(
  process.env.DATABASE_TEST_URL
).pathname.slice(1)
