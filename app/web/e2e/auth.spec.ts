import { expect, test } from '@playwright/test'
import { ADMIN, login } from './fixtures'

test('an admin logs in and reaches the gated dashboard', async ({ page }) => {
  await login(page)
  await expect(page.getByTestId('current-user')).toContainText(ADMIN.email)
})

test('a wrong password shows an error and stays on the login form', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByTestId('login-email').fill(ADMIN.email)
  await page.getByTestId('login-password').fill('not-the-password')
  await page.getByTestId('login-submit').click()

  await expect(page.getByTestId('login-error')).toBeVisible()
  await expect(page.getByTestId('login-card')).toBeVisible()
  await expect(page.getByTestId('dashboard')).toHaveCount(0)
})

test('an unknown email is rejected without revealing which field failed', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByTestId('login-email').fill('nobody@eazybox.test')
  await page.getByTestId('login-password').fill(ADMIN.password)
  await page.getByTestId('login-submit').click()

  await expect(page.getByTestId('login-error')).toHaveText(
    'E-mail ou senha inválidos'
  )
})

test('the browser blocks submitting empty required fields', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('login-submit').click()

  await expect(page.getByTestId('login-card')).toBeVisible()
  await expect(page.getByTestId('login-error')).toHaveCount(0)
})
