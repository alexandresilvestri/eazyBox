export const E2E_PORT = 3100

export const ADMIN = {
  email: 'e2e-admin@eazybox.test',
  password: 'e2e-password-123',
}

export const E2E_DB_NAME = 'eazybox_e2e'

export const E2E_APP_URL =
  process.env.DATABASE_E2E_URL ??
  `postgres://app_user@localhost:5432/${E2E_DB_NAME}`

export const E2E_OWNER_URL =
  process.env.DATABASE_E2E_OWNER_URL ??
  `postgres://postgres@localhost:5432/${E2E_DB_NAME}`

export const E2E_ADMIN_URL =
  process.env.DATABASE_E2E_ADMIN_URL ??
  'postgres://postgres@localhost:5432/postgres'
