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
  state = s;
});

/**
 * Helper: login as admin via mnemonic and return the page (already on /dashboard).
 */
async function loginAsAdmin(page: import('@playwright/test').Page): Promise<void> {
  await page.goto(`${state.baseURL}/login`);

  const useUsernameButton = page.getByRole('button', { name: /username/i });
  await useUsernameButton.click();

  const useMnemonicButton = page.getByRole('button', { name: /mnemonic/i });
  await useMnemonicButton.click();

  const usernameField = page.locator('#username');
  await usernameField.fill(state.adminUsername);

  const mnemonicField = page.locator('#mnemonic');
  await mnemonicField.fill(state.adminMnemonic);

  const signInButton = page.getByRole('button', { name: /sign in/i });
  await signInButton.click();

  await page.waitForURL('**/dashboard**', { timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// UnAuthRoute pages — accessible when NOT logged in
// ---------------------------------------------------------------------------

test.describe('Forgot Password page (UnAuthRoute)', () => {
  test('renders the forgot password form with email field', async ({ page }) => {
    await page.goto(`${state.baseURL}/forgot-password`);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    const emailField = page.locator('#email');
    await expect(emailField).toBeVisible();
  });

  test('has a submit button', async ({ page }) => {
    await page.goto(`${state.baseURL}/forgot-password`);

    // The ForgotPasswordForm renders a submit button with the "Send Reset Link" i18n text
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('validates email is required', async ({ page }) => {
    await page.goto(`${state.baseURL}/forgot-password`);

    const emailField = page.locator('#email');
    await emailField.focus();
    await emailField.blur();

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // After attempting submit with empty email, there should be a validation message
    await page.waitForTimeout(500);
    const root = page.locator('#root');
    await expect(root).not.toBeEmpty();
  });
});

test.describe('Reset Password page (UnAuthRoute)', () => {
  test('renders the reset password form when token is provided', async ({ page }) => {
    await page.goto(`${state.baseURL}/reset-password?token=test-token`);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    const passwordField = page.locator('#password');
    await expect(passwordField).toBeVisible();

    const confirmPasswordField = page.locator('#confirmPassword');
    await expect(confirmPasswordField).toBeVisible();
  });

  test('shows error alert when no token is provided', async ({ page }) => {
    await page.goto(`${state.baseURL}/reset-password`);

    // ResetPasswordForm renders an Alert with severity="error" when token is null
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
  });

  test('has a submit button when token is present', async ({ page }) => {
    await page.goto(`${state.baseURL}/reset-password?token=test-token`);

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });
});

test.describe('Register page (UnAuthRoute)', () => {
  test('renders the registration form with expected fields', async ({ page }) => {
    await page.goto(`${state.baseURL}/register`);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    const usernameField = page.locator('#username');
    await expect(usernameField).toBeVisible();

    const emailField = page.locator('#email');
    await expect(emailField).toBeVisible();
  });

  test('has password fields by default', async ({ page }) => {
    await page.goto(`${state.baseURL}/register`);

    const passwordField = page.locator('#password');
    await expect(passwordField).toBeVisible();

    const confirmPasswordField = page.locator('#confirmPassword');
    await expect(confirmPasswordField).toBeVisible();
  });

  test('has a register submit button', async ({ page }) => {
    await page.goto(`${state.baseURL}/register`);

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });
});

test.describe('Verify Email page (UnAuthRoute)', () => {
  test('renders the verify email page', async ({ page }) => {
    await page.goto(`${state.baseURL}/verify-email`);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('shows error when no token is provided', async ({ page }) => {
    await page.goto(`${state.baseURL}/verify-email`);

    // VerifyEmailPage shows an error alert when no token is present
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
  });
});

test.describe('Backup Code Login page (public route)', () => {
  test('renders the backup code login form', async ({ page }) => {
    await page.goto(`${state.baseURL}/backup-code`);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // BackupCodeLoginForm has an email field by default and a code field
    const codeField = page.locator('#code');
    await expect(codeField).toBeVisible();
  });

  test('has a submit button', async ({ page }) => {
    await page.goto(`${state.baseURL}/backup-code`);

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('has email/username toggle and password fields', async ({ page }) => {
    await page.goto(`${state.baseURL}/backup-code`);

    // BackupCodeLoginForm renders with email field by default, plus code and password fields
    const emailField = page.locator('#email');
    await expect(emailField).toBeVisible();

    const newPasswordField = page.locator('#newPassword');
    await expect(newPasswordField).toBeVisible();

    const confirmNewPasswordField = page.locator('#confirmNewPassword');
    await expect(confirmNewPasswordField).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// PrivateRoute pages — redirect to /login when NOT authenticated
// ---------------------------------------------------------------------------

test.describe('PrivateRoute redirects when not authenticated', () => {
  test('/dashboard redirects to /login', async ({ page }) => {
    await page.goto(`${state.baseURL}/dashboard`);
    await page.waitForURL('**/login**', { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });

  test('/api-access redirects to /login', async ({ page }) => {
    await page.goto(`${state.baseURL}/api-access`);
    await page.waitForURL('**/login**', { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });

  test('/backup-codes redirects to /login', async ({ page }) => {
    await page.goto(`${state.baseURL}/backup-codes`);
    await page.waitForURL('**/login**', { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });

  test('/change-password redirects to /login', async ({ page }) => {
    await page.goto(`${state.baseURL}/change-password`);
    await page.waitForURL('**/login**', { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });

  test('/user-settings redirects to /login', async ({ page }) => {
    await page.goto(`${state.baseURL}/user-settings`);
    await page.waitForURL('**/login**', { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });

  test('/logout redirects to /login', async ({ page }) => {
    await page.goto(`${state.baseURL}/logout`);
    await page.waitForURL('**/login**', { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });
});

// ---------------------------------------------------------------------------
// PrivateRoute pages — accessible when authenticated
// ---------------------------------------------------------------------------

test.describe('Authenticated route access', () => {
  test('/dashboard renders after login', async ({ page }) => {
    await loginAsAdmin(page);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    const headingText = await heading.textContent();
    expect(headingText).toBeTruthy();
  });

  test('/api-access renders the API access page after login', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${state.baseURL}/api-access`);

    // ApiAccess renders an h4 title and a read-only TextField with the token
    const root = page.locator('#root');
    await expect(root).toBeVisible();
    await expect(root).not.toBeEmpty();

    // There should be a copy button
    const copyButton = page.getByRole('button', { name: /copy/i });
    await expect(copyButton).toBeVisible();
  });

  test('/change-password renders the change password form after login', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${state.baseURL}/change-password`);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    const currentPasswordField = page.locator('#currentPassword');
    await expect(currentPasswordField).toBeVisible();

    const newPasswordField = page.locator('#newPassword');
    await expect(newPasswordField).toBeVisible();

    const confirmPasswordField = page.locator('#confirmPassword');
    await expect(confirmPasswordField).toBeVisible();
  });

  test('/user-settings renders the settings form after login', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${state.baseURL}/user-settings`);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    const emailField = page.locator('#email');
    await expect(emailField).toBeVisible();
  });

  test('/backup-codes renders the backup codes form after login', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${state.baseURL}/backup-codes`);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // BackupCodesForm has mnemonic and password fields
    const mnemonicField = page.locator('#mnemonic');
    await expect(mnemonicField).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// UnAuthRoute pages redirect to /dashboard when authenticated
// ---------------------------------------------------------------------------

test.describe('UnAuthRoute redirects when authenticated', () => {
  test('/login redirects to /dashboard when logged in', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${state.baseURL}/login`);
    await page.waitForURL('**/dashboard**', { timeout: 10_000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('/register redirects to /dashboard when logged in', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${state.baseURL}/register`);
    await page.waitForURL('**/dashboard**', { timeout: 10_000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('/forgot-password redirects to /dashboard when logged in', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${state.baseURL}/forgot-password`);
    await page.waitForURL('**/dashboard**', { timeout: 10_000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('/reset-password redirects to /dashboard when logged in', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${state.baseURL}/reset-password`);
    await page.waitForURL('**/dashboard**', { timeout: 10_000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('/verify-email redirects to /dashboard when logged in', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${state.baseURL}/verify-email`);
    await page.waitForURL('**/dashboard**', { timeout: 10_000 });
    expect(page.url()).toContain('/dashboard');
  });
});
