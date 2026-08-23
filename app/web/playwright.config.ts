import { defineConfig, devices } from '@playwright/test'
import { E2E_APP_URL, E2E_OWNER_URL, E2E_PORT } from './e2e/fixtures'

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'bun server/server.ts',
    url: `http://localhost:${E2E_PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      PORT: String(E2E_PORT),
      NODE_ENV: 'development',
      JWT_SECRET: 'e2e-secret',
      DATABASE_URL: E2E_APP_URL,
      DATABASE_OWNER_URL: E2E_OWNER_URL,
    },
  },
})
