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

/**
 * Extra browsers for the harness specs, opt-in with E2E_BROWSERS=all.
 * See the README ("Starter e2e harness") for why they are not the default.
 */
const extraBrowsers =
  process.env.E2E_BROWSERS === 'all'
    ? [
        {
          name: 'firefox',
          testIgnore: /generated-e2e-scripts\.spec\.ts$/,
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          testIgnore: /generated-e2e-scripts\.spec\.ts$/,
          use: { ...devices['Desktop Safari'] },
        },
      ]
    : [];

const GENERATED_SCRIPTS_SPEC = /generated-e2e-scripts\.spec\.ts$/;

export default defineConfig({
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',
  testDir: './src',
  timeout: 30_000,
  // Setup builds two workspaces and the last project runs the generated
  // workspaces' own e2e scripts (two stacks, each up to 15 minutes).
  globalTimeout: 2_400_000,
  retries: 0,
  use: {
    baseURL: getBaseURL(),
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: GENERATED_SCRIPTS_SPEC,
      use: { ...devices['Desktop Chrome'] },
    },
    ...extraBrowsers,
    // Runs after the browser specs: the generated web script rebuilds dist/.
    {
      name: 'generated-e2e-scripts',
      testMatch: GENERATED_SCRIPTS_SPEC,
      dependencies: ['chromium', ...extraBrowsers.map((b) => b.name)],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
