const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: 'browser.spec.cjs',
  use: {
    browserName: 'chromium',
    viewport: { width: 1280, height: 800 },
  },
});
