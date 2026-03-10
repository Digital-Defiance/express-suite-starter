import { test, expect, type ConsoleMessage } from '@playwright/test';
import { readState, E2ESharedState } from '../e2e-shared-state';

let state: E2ESharedState;

test.beforeAll(() => {
  const s = readState();
  if (!s) {
    throw new Error(
      'E2E shared state not found — global setup may have failed'
    );
  }
  if (!s.brightstack) {
    test.skip();
  }
  state = s;
});

test.describe('BrightStack App - Splash page and site basics', () => {
  test('React app renders with #root element', async ({ page }) => {
    const bs = state.brightstack;
    if (!bs) {
      test.skip();
      return;
    }
    await page.goto(bs.baseURL);

    const root = page.locator('#root');
    await expect(root).toBeVisible();
    await expect(root).not.toBeEmpty();
  });

  test('Page title is set', async ({ page }) => {
    const bs = state.brightstack;
    if (!bs) {
      test.skip();
      return;
    }
    await page.goto(bs.baseURL);
    await page.waitForFunction(() => document.title.length > 0);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('No JavaScript console errors on page load', async ({ page }) => {
    const bs = state.brightstack;
    if (!bs) {
      test.skip();
      return;
    }
    const consoleErrors: string[] = [];

    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(bs.baseURL);
    await page.waitForLoadState('networkidle');

    expect(
      consoleErrors,
      `Expected no console errors but found: ${consoleErrors.join(', ')}`
    ).toHaveLength(0);
  });
});
