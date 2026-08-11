const { defineConfig, devices } = require('@playwright/test')
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000'

module.exports = defineConfig({
  testDir: './tests',
  timeout: 120000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: 'line',
  use: {
    baseURL,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-fluid',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'webkit-iphone',
      use: {
        ...devices['iPhone 6 Plus'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120000,
  },
})
