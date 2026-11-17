import { expect, test } from './support/fixtures';

test.describe('public pages', () => {
  test('the home page renders the React app', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).not.toBeEmpty();
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('the login page offers the sign in form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
  });

  test('the API behind the app is healthy', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'ok' });
  });
});
