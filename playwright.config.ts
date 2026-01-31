import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'

// Load .env.local first, then .env for tests
dotenv.config({ path: '.env.local' })
dotenv.config()

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run tests sequentially to avoid server overload
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to prevent server crashes
  reporter: 'html',
  timeout: 60000, // 60 second timeout per test
  globalSetup: './tests/global-setup.mjs',
  
  use: {
    baseURL: 'http://127.0.0.1:3000',
    storageState: './tests/.auth/state.json',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile Chrome disabled by default - enable with: npx playwright test --project="Mobile Chrome"
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // Run local dev server before tests
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
