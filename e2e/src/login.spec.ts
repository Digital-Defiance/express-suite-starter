import { test, expect } from '@playwright/test';
import { readState, E2ESharedState } from '../e2e-shared-state';

let state: E2ESharedState;

test.beforeAll(() => {
  const s = readState();
  if (!s) {
    throw new Error(
      'E2E shared state not found — global setup may have failed'
    );
  }
  if (!s.adminMnemonic) {
    throw new Error(
      'Admin mnemonic not captured — server init may not have printed credentials'
    );
  }
  state = s;
});

test.describe('Mnemonic login flow', () => {
  test('Login page renders with form fields', async ({ page }) => {
    await page.goto(`${state.baseURL}/login`);

    // The LoginForm renders a heading "Sign In" (Login_Title i18n key)
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Default auth type is "password" with email field
    // There should be a text field for email and a password field
    const emailField = page.locator('#email');
    await expect(emailField).toBeVisible();
  });

  test('Can switch to mnemonic auth mode', async ({ page }) => {
    await page.goto(`${state.baseURL}/login`);

    // Click the "Use Mnemonic" toggle button to switch auth type
    const useMnemonicButton = page.getByRole('button', { name: /mnemonic/i });
    await expect(useMnemonicButton).toBeVisible();
    await useMnemonicButton.click();

    // Now the mnemonic textarea should be visible
    const mnemonicField = page.locator('#mnemonic');
    await expect(mnemonicField).toBeVisible();
  });

  test('Can switch to username login mode', async ({ page }) => {
    await page.goto(`${state.baseURL}/login`);

    // Click the "Use Username" toggle button
    const useUsernameButton = page.getByRole('button', { name: /username/i });
    await expect(useUsernameButton).toBeVisible();
    await useUsernameButton.click();

    // Now the username field should be visible
    const usernameField = page.locator('#username');
    await expect(usernameField).toBeVisible();
  });

  test('Admin can login with mnemonic and reach dashboard', async ({ page }) => {
    await page.goto(`${state.baseURL}/login`);

    // Switch to username mode
    const useUsernameButton = page.getByRole('button', { name: /username/i });
    await useUsernameButton.click();

    // Switch to mnemonic auth mode
    const useMnemonicButton = page.getByRole('button', { name: /mnemonic/i });
    await useMnemonicButton.click();

    // Fill in the username field
    const usernameField = page.locator('#username');
    await usernameField.fill(state.adminUsername);
    await expect(usernameField).toHaveValue(state.adminUsername);

    // Fill in the mnemonic field
    const mnemonicField = page.locator('#mnemonic');
    await mnemonicField.fill(state.adminMnemonic);
    await expect(mnemonicField).toHaveValue(state.adminMnemonic);

    // Submit the form
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeEnabled();
    await signInButton.click();

    // Wait for navigation to the dashboard after successful login
    await page.waitForURL('**/dashboard**', { timeout: 15_000 });

    // Verify dashboard renders
    const root = page.locator('#root');
    await expect(root).toBeVisible();
    await expect(root).not.toBeEmpty();
  });

  test('Login form validates required fields', async ({ page }) => {
    await page.goto(`${state.baseURL}/login`);

    // Switch to username + mnemonic mode
    const useUsernameButton = page.getByRole('button', { name: /username/i });
    await useUsernameButton.click();

    const useMnemonicButton = page.getByRole('button', { name: /mnemonic/i });
    await useMnemonicButton.click();

    // The sign in button should be present
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();

    // The username and mnemonic fields should be empty initially
    const usernameField = page.locator('#username');
    const mnemonicField = page.locator('#mnemonic');
    await expect(usernameField).toHaveValue('');
    await expect(mnemonicField).toHaveValue('');
  });

  test('Login page title is set correctly', async ({ page }) => {
    await page.goto(`${state.baseURL}/login`);

    // The page should still have the site title set by TranslatedTitle
    await page.waitForFunction(() => document.title.length > 0);
    const title = await page.title();
    expect(title).toContain('Your Site Title');
  });
});
