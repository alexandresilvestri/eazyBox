import { expect, test } from '@playwright/test'
import { login } from './fixtures'

test('a visitor with no session sees the login form', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('login-card')).toBeVisible()
  await expect(page.getByTestId('dashboard')).toHaveCount(0)
})

test('the session survives a reload', async ({ page }) => {
  await login(page)
  await page.reload()
  await expect(page.getByTestId('dashboard')).toBeVisible()
})

test('the access token is stored in an httpOnly cookie, not in JS', async ({
  page,
  context,
}) => {
  await login(page)

  const cookies = await context.cookies()
  const session = cookies.find((cookie) => cookie.name === 'session')
  expect(session?.httpOnly).toBe(true)

  const reachable = await page.evaluate(() => document.cookie)
  expect(reachable).not.toContain('session=')
})

test('logging out returns to the login form and does not survive a reload', async ({
  page,
}) => {
  await login(page)
  await page.getByTestId('logout').click()
  await expect(page.getByTestId('login-card')).toBeVisible()

  await page.reload()
  await expect(page.getByTestId('login-card')).toBeVisible()
  await expect(page.getByTestId('dashboard')).toHaveCount(0)
})
