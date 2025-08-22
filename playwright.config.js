// Playwright configuration for responsive visual checks
import { devices } from '@playwright/test';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests/playwright',
  timeout: 30 * 1000,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.02 } },
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3001',
    actionTimeout: 10 * 1000,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'Desktop', use: { viewport: { width: 1280, height: 800 }, ...devices['Desktop Chrome'] } },
    { name: 'Tablet', use: { viewport: { width: 820, height: 1180 }, ...devices['iPad (gen 7)'] } },
    { name: 'Mobile', use: { viewport: devices['iPhone 12'].viewport, ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'set PORT=3001 && npm run dev',
    port: 3001,
    reuseExistingServer: true,
    timeout: 120_000,
  },
};

export default config;
