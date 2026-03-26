/**
 * Integration tests for translation providers.
 *
 * These make real network calls and are skipped by default.
 * Run with: RUN_TRANSLATION_TESTS=true npx jest translation-providers
 *
 * For AWS Translate tests, you also need valid AWS credentials configured
 * (env vars or ~/.aws/credentials).
 */

import {
  GoogleTranslateProvider,
  AwsTranslateProvider,
} from '../../src/utils/translation-service';
import * as fs from 'fs';
import * as path from 'path';

const SKIP_REASON = 'Set RUN_TRANSLATION_TESTS=true to run';
const shouldRun = process.env.RUN_TRANSLATION_TESTS === 'true';

// Helper: basic check that a translation looks different from the input
// (not a perfect check, but catches "returned the same text" failures)
function looksTranslated(original: string, translated: string): boolean {
  // For CJK targets the text will definitely differ
  // For European languages, at least some characters should differ
  return translated.length > 0 && translated !== original;
}

describe('Translation Provider Integration Tests', () => {
  describe('GoogleTranslateProvider', () => {
    const provider = new GoogleTranslateProvider();

    const runOrSkip = shouldRun ? it : it.skip;

    runOrSkip(
      'translates English to French',
      async () => {
        const result = await provider.translate('Hello world', 'en', 'fr');
        expect(result.wasTranslated).toBe(true);
        expect(result.text.length).toBeGreaterThan(0);
        expect(looksTranslated('Hello world', result.text)).toBe(true);
      },
      15000,
    );

    runOrSkip(
      'translates English to Japanese',
      async () => {
        const result = await provider.translate('My Site Title', 'en', 'ja');
        expect(result.wasTranslated).toBe(true);
        expect(result.text.length).toBeGreaterThan(0);
        // Japanese should contain non-ASCII characters
        expect(/[^\x00-\x7F]/.test(result.text)).toBe(true);
      },
      15000,
    );

    runOrSkip(
      'translates English to Chinese',
      async () => {
        const result = await provider.translate(
          'Your description here',
          'en',
          'zh-CN',
        );
        expect(result.wasTranslated).toBe(true);
        expect(/[^\x00-\x7F]/.test(result.text)).toBe(true);
      },
      15000,
    );

    runOrSkip(
      'translates French to English',
      async () => {
        const result = await provider.translate('Bonjour le monde', 'fr', 'en');
        expect(result.wasTranslated).toBe(true);
        expect(result.text.toLowerCase()).toContain('hello');
      },
      15000,
    );

    if (!shouldRun) {
      it(`skipped: ${SKIP_REASON}`, () => {
        expect(true).toBe(true);
      });
    }
  });

  describe('AwsTranslateProvider', () => {
    const hasAwsEnvVars =
      !!process.env.AWS_ACCESS_KEY_ID || !!process.env.AWS_PROFILE;
    const hasAwsCredFile = (() => {
      try {
        const credPath = path.join(
          process.env.HOME ?? process.env.USERPROFILE ?? '',
          '.aws',
          'credentials',
        );
        fs.accessSync(credPath, fs.constants.R_OK);
        return true;
      } catch {
        return false;
      }
    })();
    const shouldRunAws = shouldRun && (hasAwsEnvVars || hasAwsCredFile);

    // AWS SDK v3 requires --experimental-vm-modules in Jest.
    // Run with: NODE_OPTIONS=--experimental-vm-modules RUN_TRANSLATION_TESTS=true npx jest translation-providers
    const canLoadSdk = (() => {
      try {
        require('@aws-sdk/client-translate');
        return true;
      } catch {
        return false;
      }
    })();

    const runOrSkip = shouldRunAws && canLoadSdk ? it : it.skip;

    runOrSkip(
      'translates English to German',
      async () => {
        const provider = new AwsTranslateProvider();
        const result = await provider.translate('Hello world', 'en', 'de');
        expect(result.wasTranslated).toBe(true);
        expect(looksTranslated('Hello world', result.text)).toBe(true);
      },
      15000,
    );

    runOrSkip(
      'translates English to Ukrainian',
      async () => {
        const provider = new AwsTranslateProvider();
        const result = await provider.translate('My Site Title', 'en', 'uk');
        expect(result.wasTranslated).toBe(true);
        expect(/[^\x00-\x7F]/.test(result.text)).toBe(true);
      },
      15000,
    );

    if (!shouldRunAws || !canLoadSdk) {
      it(`skipped: ${!shouldRun ? SKIP_REASON : !hasAwsEnvVars && !hasAwsCredFile ? 'AWS credentials required' : 'Run with NODE_OPTIONS=--experimental-vm-modules'}`, () => {
        expect(true).toBe(true);
      });
    }
  });
});
