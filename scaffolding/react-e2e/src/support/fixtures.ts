import { expect, test as base } from '@playwright/test';

/**
 * `test` for the browser e2e specs. Import it from here instead of
 * '@playwright/test'.
 *
 * The API sends a Content-Security-Policy with `upgrade-insecure-requests`.
 * Chromium and Firefox exempt http://localhost from the upgrade, but WebKit
 * does not: it requests the scripts over https and the page never loads.
 * For WebKit only, this fixture removes that one directive from the document
 * response so the app can be tested over plain http. Every other directive of
 * the policy stays in place.
 */
export const test = base.extend({
  context: async ({ context, browserName }, provide) => {
    if (browserName === 'webkit') {
      await context.route('**/*', async (route) => {
        if (route.request().resourceType() !== 'document') {
          await route.continue();
          return;
        }
        const response = await route.fetch();
        const headers = response.headers();
        const policy = headers['content-security-policy'];
        if (policy) {
          headers['content-security-policy'] = policy
            .split(';')
            .map((directive) => directive.trim())
            .filter((directive) => directive !== 'upgrade-insecure-requests')
            .join('; ');
        }
        await route.fulfill({ response, headers });
      });
    }
    // Named provide, not use: the React Hooks lint rule mistakes use() for a hook.
    await provide(context);
  },
});

export { expect };
