import { expect, test } from '@playwright/test'

const EXPECTED_UNAUTHENTICATED_PROBE = '401'

test('the health route reports the server and redis', async ({ request }) => {
  const res = await request.get('/api/health')
  expect(res.status()).toBe(200)
  expect(await res.json()).toEqual({ status: 'ok', redis: 'ok' })
})

test('the app shell renders the login card with no unexpected errors', async ({
  page,
}) => {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/')
  await expect(page.getByTestId('login-card')).toBeVisible()

  expect(pageErrors).toEqual([])
  expect(
    consoleErrors.filter(
      (text) => !text.includes(EXPECTED_UNAUTHENTICATED_PROBE)
    )
  ).toEqual([])
})

test('the unauthenticated session probe is the only failing request', async ({
  page,
}) => {
  const failed: string[] = []
  page.on('response', (response) => {
    if (!response.ok()) failed.push(`${response.status()} ${response.url()}`)
  })

  await page.goto('/')
  await expect(page.getByTestId('login-card')).toBeVisible()

  expect(failed).toHaveLength(1)
  expect(failed[0]).toContain('/api/auth/me')
  expect(failed[0]).toContain('401')
})
