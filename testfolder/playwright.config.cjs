const { defineConfig } = require('@playwright/test');
const { join } = require('node:path');

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: 'browser.spec.cjs',
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never', outputFolder: join(__dirname, 'playwright-report') }]]
    : 'list',
  use: {
    browserName: 'chromium',
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
