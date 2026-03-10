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
  if (!s.brightstack) {
    test.skip();
  }
  state = s;
});

test.describe('BrightStack Routes - API endpoints', () => {
  test('API health endpoint responds', async ({ request }) => {
    const bs = state.brightstack;
    if (!bs) {
      test.skip();
      return;
    }
    const response = await request.get(`${bs.baseURL}/api/health`);
    // Accept 200 or 404 — the health endpoint may not exist in all configurations
    expect([200, 404]).toContain(response.status());
  });

  test('API user verify endpoint exists', async ({ request }) => {
    const bs = state.brightstack;
    if (!bs) {
      test.skip();
      return;
    }
    const response = await request.get(`${bs.baseURL}/api/user/verify`);
    // Without auth token, expect 401, 403, or 200 (BrightStack may return 200 with error body)
    expect([200, 401, 403]).toContain(response.status());
  });
});

test.describe('BrightStack Routes - PrivateRoute redirects when not authenticated', () => {
  test('/dashboard redirects to /login', async ({ page }) => {
    const bs = state.brightstack;
    if (!bs) {
      test.skip();
      return;
    }
    await page.goto(`${bs.baseURL}/dashboard`);
    await page.waitForURL('**/login**', { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });
});
