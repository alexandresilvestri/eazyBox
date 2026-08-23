import { expect, type Page } from '@playwright/test'

export const E2E_PORT = 3100

export const ADMIN = {
  email: 'e2e-admin@eazybox.test',
  password: 'e2e-password-123',
}

export const E2E_DB_NAME = 'eazybox_e2e'
export const E2E_APP_URL = `postgres://app_user@localhost:5432/${E2E_DB_NAME}`
export const E2E_OWNER_URL = `postgres://postgres@localhost:5432/${E2E_DB_NAME}`
export const E2E_ADMIN_URL = 'postgres://postgres@localhost:5432/postgres'

export async function login(page: Page) {
  await page.goto('/')
  await page.getByTestId('login-email').fill(ADMIN.email)
  await page.getByTestId('login-password').fill(ADMIN.password)
  await page.getByTestId('login-submit').click()
  await expect(page.getByTestId('dashboard')).toBeVisible()
}
