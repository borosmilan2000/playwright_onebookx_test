import { defineConfig, devices } from '@playwright/test';
import { AuthHelper } from './tests/utils/auth';  // ← Updated path

export default defineConfig({
  timeout: 60000,
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  
  reporter: [
    ['html'],
    ['list']
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'https://staging.onebookx.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Load saved storage state for all tests
    //storageState: AuthHelper.loadStorageState(),
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});