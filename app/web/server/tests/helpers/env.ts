const HOST = process.env.TEST_DB_HOST ?? 'localhost'
const PORT = process.env.TEST_DB_PORT ?? '5432'
const NAME = process.env.TEST_DB_NAME ?? 'eazybox_test'

export const OWNER_ADMIN_URL = `postgres://postgres@${HOST}:${PORT}/postgres`
export const TEST_DB_NAME = NAME

process.env.NODE_ENV = 'test'
process.env.DATABASE_TEST_URL = `postgres://postgres@${HOST}:${PORT}/${NAME}`
process.env.DATABASE_URL = `postgres://app_user@${HOST}:${PORT}/${NAME}`
process.env.JWT_SECRET ??= 'test-secret'
