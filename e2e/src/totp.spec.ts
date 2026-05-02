/**
 * @fileoverview E2E tests for TOTP two-factor authentication flows.
 *
 * These tests exercise the full TOTP lifecycle against a real scaffolded app:
 *   1. Register a dedicated test user via the API (capturing the mnemonic)
 *   2. Enable TOTP via the user settings page
 *   3. Log out and log back in — verify the TOTP verification step appears
 *   4. Complete TOTP login with a valid code
 *   5. Disable TOTP via the user settings page
 *
 * TOTP codes are generated using `otplib` from the raw base32 secret returned
 * by the setup endpoint. The secret is captured by intercepting the API
 * response when the UI calls POST /user/totp/setup.
 *
 * Prerequisites:
 *   - The server must be running with TOTP_AVAILABLE=true in its environment
 *     (patched by global-setup.ts).
 *   - The `otplib` package must be installed as a dev dependency.
 *
 * Login mechanism:
 *   The scaffolded app uses mnemonic-based challenge login (not a simple
 *   password endpoint). The mnemonic is returned during registration and
 *   stored for use in subsequent login steps.
 */

import { test, expect, type APIRequestContext } from '@playwright/test';
import { generateSync } from 'otplib';
import { readState, E2ESharedState } from '../e2e-shared-state';

// ─── Shared state ────────────────────────────────────────────────────────────

let state: E2ESharedState;

test.beforeAll(() => {
  const s = readState();
  if (!s) {
    throw new Error('E2E shared state not found — global setup may have failed');
  }
  state = s;
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Register a new user via the API and return their credentials including mnemonic.
 * Uses a unique username/email per test run to avoid conflicts.
 */
async function registerTestUser(
  request: APIRequestContext,
  suffix: string,
): Promise<{ username: string; email: string; mnemonic: string }> {
  const username = `totp-test-${suffix}`;
  const email = `totp-test-${suffix}@example.com`;

  const response = await request.post(`${state.baseURL}/api/user/register`, {
    data: { username, email, timezone: 'UTC' },
  });

  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Registration failed (${response.status()}): ${body}`);
  }

  const body = await response.json();
  const mnemonic: string = body.mnemonic ?? body.data?.mnemonic ?? '';
  if (!mnemonic) {
    throw new Error('Registration response did not include a mnemonic');
  }

  return { username, email, mnemonic };
}

/**
 * Log in via the UI using the mnemonic challenge flow (username + mnemonic).
 * Does not wait for navigation after clicking Sign In — the caller decides
 * what to wait for (normal dashboard redirect vs TOTP verification form).
 */
async function uiLoginWithMnemonic(
  page: import('@playwright/test').Page,
  username: string,
  mnemonic: string,
): Promise<void> {
  await page.goto(`${state.baseURL}/login`);

  // Switch to username mode
  const useUsernameButton = page.getByRole('button', { name: /username/i });
  await expect(useUsernameButton).toBeVisible();
  await useUsernameButton.click();

  // Switch to mnemonic auth mode
  const useMnemonicButton = page.getByRole('button', { name: /mnemonic/i });
  await expect(useMnemonicButton).toBeVisible();
  await useMnemonicButton.click();

  await page.locator('#username').fill(username);
  await page.locator('#mnemonic').fill(mnemonic);

  await page.getByRole('button', { name: /sign in/i }).click();
}

/**
 * Navigate to user settings and wait for the settings form to load.
 */
async function goToSettings(
  page: import('@playwright/test').Page,
): Promise<void> {
  await page.goto(`${state.baseURL}/user-settings`);
  await expect(page.locator('h1')).toBeVisible({ timeout: 10_000 });
}

/**
 * Log out by navigating to /logout.
 */
async function logout(page: import('@playwright/test').Page): Promise<void> {
  await page.goto(`${state.baseURL}/logout`);
  await page.waitForURL('**/login**', { timeout: 10_000 });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('TOTP two-factor authentication', () => {
  /**
   * Full TOTP lifecycle: enable → login with TOTP → disable.
   *
   * Registers a fresh user, enables TOTP via the settings UI, logs out,
   * logs back in through the TOTP verification step, then disables TOTP.
   */
  test('full TOTP lifecycle: enable, login with TOTP, disable', async ({
    page,
    request,
  }) => {
    // ── Step 1: Register a test user ────────────────────────────────────────
    const suffix = Date.now().toString(36);
    const { username, mnemonic } = await registerTestUser(request, suffix);

    // ── Step 2: Log in via the UI (no TOTP yet — normal flow) ────────────────
    await uiLoginWithMnemonic(page, username, mnemonic);
    await page.waitForURL('**/dashboard**', { timeout: 15_000 });

    // ── Step 3: Navigate to settings and verify TOTP section is visible ───────
    await goToSettings(page);

    await expect(
      page.getByText(/two-factor authentication/i),
    ).toBeVisible({ timeout: 10_000 });

    await expect(page.getByText(/2fa is currently disabled/i)).toBeVisible();

    const enableButton = page.getByTestId('enable-totp-button');
    await expect(enableButton).toBeVisible();

    // ── Step 4: Click "Enable 2FA" and capture the secret from the response ───
    // Intercept the setup API response to get the raw base32 secret.
    const setupResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/user/totp/setup') && resp.status() === 200,
    );

    await enableButton.click();

    const setupResponse = await setupResponsePromise;
    const setupBody = await setupResponse.json();
    const totpSecret: string = setupBody.secret;
    expect(totpSecret).toBeTruthy();
    expect(totpSecret).toMatch(/^[A-Z2-7]+=*$/); // base32 format

    // ── Step 5: TotpSetupForm should appear with QR code and secret ───────────
    await expect(page.getByTestId('qr-code-svg')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(totpSecret)).toBeVisible();

    // ── Step 6: Generate a valid TOTP code and confirm ────────────────────────
    const confirmCode = generateSync({ secret: totpSecret });
    expect(confirmCode).toMatch(/^\d{6}$/);

    const codeInput = page.getByLabel(/confirmation code/i);
    await codeInput.fill(confirmCode);

    const confirmButton = page.getByRole('button', { name: /confirm/i });
    await confirmButton.click();

    // Status should update to enabled
    await expect(page.getByText(/2fa is currently enabled/i)).toBeVisible({
      timeout: 10_000,
    });

    // ── Step 7: Log out ───────────────────────────────────────────────────────
    await logout(page);

    // ── Step 8: Log back in — TOTP verification form should appear ───────────
    await uiLoginWithMnemonic(page, username, mnemonic);

    // Should NOT navigate to dashboard yet
    await expect(
      page.getByRole('heading', { name: /two-factor authentication/i }),
    ).toBeVisible({ timeout: 10_000 });
    expect(page.url()).not.toContain('/dashboard');

    // ── Step 9: Enter a valid TOTP code to complete login ─────────────────────
    const loginCode = generateSync({ secret: totpSecret });
    expect(loginCode).toMatch(/^\d{6}$/);

    const totpCodeInput = page.getByLabel(/authentication code/i);
    await totpCodeInput.fill(loginCode);

    await page.getByRole('button', { name: /verify/i }).click();

    // Should navigate to dashboard after successful TOTP verification
    await page.waitForURL('**/dashboard**', { timeout: 15_000 });

    // ── Step 10: Navigate to settings and disable TOTP ────────────────────────
    await goToSettings(page);

    await expect(page.getByText(/2fa is currently enabled/i)).toBeVisible({
      timeout: 10_000,
    });

    const disableButton = page.getByTestId('disable-totp-button');
    await expect(disableButton).toBeVisible();
    await disableButton.click();

    await expect(
      page.getByText(/enter your current 2fa code to disable/i),
    ).toBeVisible({ timeout: 5_000 });

    const disableCode = generateSync({ secret: totpSecret });
    await page.getByLabel(/totp code/i).fill(disableCode);
    await page.getByTestId('disable-totp-submit-button').click();

    await expect(page.getByText(/2fa is currently disabled/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  /**
   * Verify the TOTP section appears in settings when TOTP_AVAILABLE=true.
   * Uses the admin user (no TOTP enabled) to check the UI renders correctly.
   */
  test('settings page shows TOTP section when TOTP_AVAILABLE=true', async ({
    page,
  }) => {
    await uiLoginWithMnemonic(page, state.adminUsername, state.adminMnemonic);
    await page.waitForURL('**/dashboard**', { timeout: 15_000 });

    await goToSettings(page);

    // TOTP section should be visible since TOTP_AVAILABLE=true
    await expect(
      page.getByText(/two-factor authentication/i),
    ).toBeVisible({ timeout: 10_000 });

    // Admin has no TOTP enabled, so "Enable 2FA" button should be present
    await expect(page.getByTestId('enable-totp-button')).toBeVisible();
  });

  /**
   * Verify that entering an invalid TOTP code during login shows an error
   * and does not navigate to the dashboard.
   *
   * This test enables TOTP via the API (using the JWT from the UI login
   * session stored in localStorage) then logs out and back in.
   */
  test('invalid TOTP code during login shows error and stays on verification form', async ({
    page,
    request,
  }) => {
    // Register a fresh user
    const suffix = `inv-${Date.now().toString(36)}`;
    const { username, mnemonic } = await registerTestUser(request, suffix);

    // Log in via UI to get an authenticated session
    await uiLoginWithMnemonic(page, username, mnemonic);
    await page.waitForURL('**/dashboard**', { timeout: 15_000 });

    // Navigate to settings and enable TOTP via the UI, capturing the secret
    await goToSettings(page);
    await expect(page.getByTestId('enable-totp-button')).toBeVisible({
      timeout: 10_000,
    });

    const setupResponsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('/user/totp/setup') && resp.status() === 200,
    );
    await page.getByTestId('enable-totp-button').click();

    const setupResponse = await setupResponsePromise;
    const { secret: totpSecret } = await setupResponse.json();

    // Confirm TOTP with a valid code
    await expect(page.getByTestId('qr-code-svg')).toBeVisible({
      timeout: 10_000,
    });
    const confirmCode = generateSync({ secret: totpSecret });
    await page.getByLabel(/confirmation code/i).fill(confirmCode);
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.getByText(/2fa is currently enabled/i)).toBeVisible({
      timeout: 10_000,
    });

    // Log out
    await logout(page);

    // Log back in — TOTP verification form should appear
    await uiLoginWithMnemonic(page, username, mnemonic);
    await expect(
      page.getByRole('heading', { name: /two-factor authentication/i }),
    ).toBeVisible({ timeout: 10_000 });

    // Enter an obviously wrong code (000000 is almost certainly invalid)
    await page.getByLabel(/authentication code/i).fill('000000');
    await page.getByRole('button', { name: /verify/i }).click();

    // Should show an error message
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 });

    // Should NOT navigate to dashboard
    expect(page.url()).not.toContain('/dashboard');

    // Verification form should still be visible
    await expect(
      page.getByRole('heading', { name: /two-factor authentication/i }),
    ).toBeVisible();
  });
});
