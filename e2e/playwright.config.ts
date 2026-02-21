import { defineConfig, devices } from '@playwright/test';
import { readState } from './e2e-shared-state';

/**
 * Read the base URL from the shared state file written by global setup.
 * Falls back to http://localhost:3000 if the state file doesn't exist yet
 * (e.g., during config resolution before global setup runs).
 */
function getBaseURL(): string {
  const state = readState();
  return state?.baseURL ?? 'http://localhost:3000';
}

export default defineConfig({
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',
  testDir: './src',
  timeout: 30_000,
  globalTimeout: 600_000,
  retries: 0,
  use: {
    baseURL: getBaseURL(),
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
