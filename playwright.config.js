// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:3000';

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- --hostname 127.0.0.1',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },

  use: {
    baseURL,
    // Tangkap screenshot hanya saat test gagal
    screenshot: 'only-on-failure',
    // Simpan video hanya saat test gagal
    video: 'retain-on-failure',
    // Trace untuk debugging
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
