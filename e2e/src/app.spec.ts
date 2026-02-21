import { test, expect, type ConsoleMessage, type Page } from '@playwright/test';
import { readState, E2ESharedState } from '../e2e-shared-state';

let state: E2ESharedState;

test.beforeAll(() => {
  const s = readState();
  if (!s) {
    throw new Error(
      'E2E shared state not found — global setup may have failed'
    );
  }
  state = s;
});

test.describe('Splash page and site basics', () => {
  test('React app renders with #root element', async ({ page }) => {
    await page.goto(state.baseURL);

    const root = page.locator('#root');
    await expect(root).toBeVisible();
    await expect(root).not.toBeEmpty();
  });

  test('Page title is set via i18n (Common_SiteTemplate)', async ({ page }) => {
    await page.goto(state.baseURL);
    // TranslatedTitle sets document.title to the i18n-resolved Common_SiteTemplate
    // which resolves to the {Site} variable from AppConstants.Site
    // For the generated project, this defaults to "Your Site Title"
    await page.waitForFunction(() => document.title.length > 0);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    // The default site title for a generated project is "Your Site Title"
    expect(title).toContain('Your Site Title');
  });

  test('Splash page shows workspace welcome message', async ({ page }) => {
    await page.goto(state.baseURL);
    // SplashPage renders: "Welcome to @WORKSPACENAME@" which gets replaced
    // with the actual workspace name during scaffolding
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    const headingText = await heading.textContent();
    expect(headingText).toContain(state.workspaceName);
  });

  test('Splash page has Login and Register buttons when not authenticated', async ({ page }) => {
    await page.goto(state.baseURL);
    const loginButton = page.getByRole('button', { name: /login/i });
    const registerButton = page.getByRole('button', { name: /register/i });
    await expect(loginButton).toBeVisible();
    await expect(registerButton).toBeVisible();
  });

  test('No JavaScript console errors on page load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(state.baseURL);
    await page.waitForLoadState('networkidle');

    expect(
      consoleErrors,
      `Expected no console errors but found: ${consoleErrors.join(', ')}`
    ).toHaveLength(0);
  });
});
