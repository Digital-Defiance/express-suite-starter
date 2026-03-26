import {
  GoogleTranslateProvider,
  AwsTranslateProvider,
  translateSiteStrings,
  buildFallbackTranslations,
  translationsToMustacheVars,
  isSameFamily,
  getApiLanguageCode,
  ALL_TARGET_LANGUAGES,
} from '../../src/utils/translation-service';
import type {
  TranslationProvider,
  SiteStringsTranslations,
} from '../../src/utils/translation-service';
import { LanguageCodes } from '@digitaldefiance/i18n-lib';
import * as https from 'https';

jest.mock('https');

const identity = (s: string): string => s;

describe('translation-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getApiLanguageCode', () => {
    it('maps en-US to en', () => {
      expect(getApiLanguageCode(LanguageCodes.EN_US)).toBe('en');
    });

    it('maps en-GB to en', () => {
      expect(getApiLanguageCode(LanguageCodes.EN_GB)).toBe('en');
    });

    it('maps zh-CN to zh-CN', () => {
      expect(getApiLanguageCode(LanguageCodes.ZH_CN)).toBe('zh-CN');
    });

    it('returns input for unknown codes', () => {
      expect(getApiLanguageCode('pt-BR')).toBe('pt-BR');
    });
  });

  describe('isSameFamily', () => {
    it('returns true for en-US and en-GB', () => {
      expect(isSameFamily(LanguageCodes.EN_US, LanguageCodes.EN_GB)).toBe(true);
    });

    it('returns false for en-US and fr', () => {
      expect(isSameFamily(LanguageCodes.EN_US, LanguageCodes.FR)).toBe(false);
    });

    it('returns true for same language', () => {
      expect(isSameFamily(LanguageCodes.FR, LanguageCodes.FR)).toBe(true);
    });
  });

  describe('buildFallbackTranslations', () => {
    it('uses original text for source language', () => {
      const result = buildFallbackTranslations(
        LanguageCodes.EN_US,
        'My Site',
        'My description',
        'My tagline',
      );

      expect(result.siteTitle[LanguageCodes.EN_US].text).toBe('My Site');
      expect(result.siteTitle[LanguageCodes.EN_US].wasTranslated).toBe(false);
      expect(result.providerUsed).toBe('none');
    });

    it('copies verbatim for same-family languages', () => {
      const result = buildFallbackTranslations(
        LanguageCodes.EN_US,
        'My Site',
        'My description',
        'My tagline',
      );

      expect(result.siteTitle[LanguageCodes.EN_GB].text).toBe('My Site');
      expect(result.failedLanguages).not.toContain(LanguageCodes.EN_GB);
    });

    it('uses original text for other languages and marks them as failed', () => {
      const result = buildFallbackTranslations(
        LanguageCodes.EN_US,
        'My Site',
        'My description',
        'My tagline',
      );

      expect(result.siteTitle[LanguageCodes.FR].text).toBe('My Site');
      expect(result.siteDescription[LanguageCodes.FR].text).toBe('My description');
      expect(result.failedLanguages).toContain(LanguageCodes.FR);
      expect(result.failedLanguages).toContain(LanguageCodes.DE);
      expect(result.failedLanguages).toContain(LanguageCodes.JA);
    });

    it('does not include source or same-family in failedLanguages', () => {
      const result = buildFallbackTranslations(
        LanguageCodes.EN_US,
        'My Site',
        'My description',
        'My tagline',
      );

      expect(result.failedLanguages).not.toContain(LanguageCodes.EN_US);
      expect(result.failedLanguages).not.toContain(LanguageCodes.EN_GB);
    });

    it('covers all target languages', () => {
      const result = buildFallbackTranslations(
        LanguageCodes.FR,
        'Mon Site',
        'Ma description',
        'Mon slogan',
      );

      for (const lang of ALL_TARGET_LANGUAGES) {
        expect(result.siteTitle[lang]).toBeDefined();
        expect(result.siteDescription[lang]).toBeDefined();
        expect(result.siteTagline[lang]).toBeDefined();
      }
    });
  });

  describe('translationsToMustacheVars', () => {
    it('produces per-language variable keys', () => {
      const translations = buildFallbackTranslations(
        LanguageCodes.EN_US,
        'My Site',
        'My description',
        'My tagline',
      );

      const vars = translationsToMustacheVars(translations, identity);

      expect(vars.siteTitleEnUs).toBe('My Site');
      expect(vars.siteDescriptionEnUs).toBe('My description');
      expect(vars.siteTaglineEnUs).toBe('My tagline');
      expect(vars.siteTitleFr).toBe('My Site');
      expect(vars.siteTitleJa).toBe('My Site');
    });

    it('sets needsTranslation flags for failed languages', () => {
      const translations = buildFallbackTranslations(
        LanguageCodes.EN_US,
        'My Site',
        'My description',
        'My tagline',
      );

      const vars = translationsToMustacheVars(translations, identity);

      expect(vars.needsTranslationEnUs).toBe(false);
      expect(vars.needsTranslationEnGb).toBe(false);
      expect(vars.needsTranslationFr).toBe(true);
      expect(vars.needsTranslationDe).toBe(true);
      expect(vars.needsTranslationZhCn).toBe(true);
      expect(vars.needsTranslationJa).toBe(true);
      expect(vars.needsTranslationUk).toBe(true);
    });

    it('applies escape function to string values', () => {
      const translations = buildFallbackTranslations(
        LanguageCodes.EN_US,
        "It's a test",
        'Desc',
        'Tag',
      );

      const escaper = (s: string): string => s.replace(/'/g, "\\'");
      const vars = translationsToMustacheVars(translations, escaper);

      expect(vars.siteTitleEnUs).toBe("It\\'s a test");
    });

    it('does not set needsTranslation for successfully translated languages', () => {
      const translations: SiteStringsTranslations = {
        siteTitle: {
          [LanguageCodes.EN_US]: { text: 'My Site', wasTranslated: false },
          [LanguageCodes.EN_GB]: { text: 'My Site', wasTranslated: false },
          [LanguageCodes.FR]: { text: 'Mon Site', wasTranslated: true },
          [LanguageCodes.ES]: { text: 'Mi Sitio', wasTranslated: true },
          [LanguageCodes.DE]: { text: 'Meine Seite', wasTranslated: true },
          [LanguageCodes.ZH_CN]: { text: '我的网站', wasTranslated: true },
          [LanguageCodes.JA]: { text: '私のサイト', wasTranslated: true },
          [LanguageCodes.UK]: { text: 'Мій сайт', wasTranslated: true },
        },
        siteDescription: {
          [LanguageCodes.EN_US]: { text: 'Desc', wasTranslated: false },
          [LanguageCodes.EN_GB]: { text: 'Desc', wasTranslated: false },
          [LanguageCodes.FR]: { text: 'Desc FR', wasTranslated: true },
          [LanguageCodes.ES]: { text: 'Desc ES', wasTranslated: true },
          [LanguageCodes.DE]: { text: 'Desc DE', wasTranslated: true },
          [LanguageCodes.ZH_CN]: { text: 'Desc ZH', wasTranslated: true },
          [LanguageCodes.JA]: { text: 'Desc JA', wasTranslated: true },
          [LanguageCodes.UK]: { text: 'Desc UK', wasTranslated: true },
        },
        siteTagline: {
          [LanguageCodes.EN_US]: { text: 'Tag', wasTranslated: false },
          [LanguageCodes.EN_GB]: { text: 'Tag', wasTranslated: false },
          [LanguageCodes.FR]: { text: 'Tag FR', wasTranslated: true },
          [LanguageCodes.ES]: { text: 'Tag ES', wasTranslated: true },
          [LanguageCodes.DE]: { text: 'Tag DE', wasTranslated: true },
          [LanguageCodes.ZH_CN]: { text: 'Tag ZH', wasTranslated: true },
          [LanguageCodes.JA]: { text: 'Tag JA', wasTranslated: true },
          [LanguageCodes.UK]: { text: 'Tag UK', wasTranslated: true },
        },
        failedLanguages: [],
        providerUsed: 'google-free',
      };

      const vars = translationsToMustacheVars(translations, identity);

      expect(vars.needsTranslationFr).toBe(false);
      expect(vars.needsTranslationEs).toBe(false);
      expect(vars.needsTranslationDe).toBe(false);
      expect(vars.siteTitleFr).toBe('Mon Site');
    });
  });

  describe('translateSiteStrings', () => {
    const mockProvider: TranslationProvider = {
      name: 'mock',
      displayName: 'Mock Provider',
      isPaid: false,
      isAvailable: async () => true,
      translate: async (text: string, _from: string, toLang: string) => ({
        text: `[${toLang}] ${text}`,
        wasTranslated: true,
      }),
    };

    it('uses original text for source language', async () => {
      const result = await translateSiteStrings(
        mockProvider,
        LanguageCodes.EN_US,
        'My Site',
        'My desc',
        'My tag',
      );

      expect(result.siteTitle[LanguageCodes.EN_US].text).toBe('My Site');
      expect(result.siteTitle[LanguageCodes.EN_US].wasTranslated).toBe(false);
    });

    it('copies verbatim for same-family languages', async () => {
      const result = await translateSiteStrings(
        mockProvider,
        LanguageCodes.EN_US,
        'My Site',
        'My desc',
        'My tag',
      );

      expect(result.siteTitle[LanguageCodes.EN_GB].text).toBe('My Site');
      expect(result.siteTitle[LanguageCodes.EN_GB].wasTranslated).toBe(false);
    });

    it('translates other languages via provider', async () => {
      const result = await translateSiteStrings(
        mockProvider,
        LanguageCodes.EN_US,
        'My Site',
        'My desc',
        'My tag',
      );

      expect(result.siteTitle[LanguageCodes.FR].text).toBe('[fr] My Site');
      expect(result.siteTitle[LanguageCodes.FR].wasTranslated).toBe(true);
      expect(result.siteDescription[LanguageCodes.DE].text).toBe('[de] My desc');
      expect(result.siteTagline[LanguageCodes.JA].text).toBe('[ja] My tag');
    });

    it('falls back to original text on per-language failure', async () => {
      const failingProvider: TranslationProvider = {
        name: 'failing',
        displayName: 'Failing Provider',
        isPaid: false,
        isAvailable: async () => true,
        translate: async (_text: string, _from: string, toLang: string) => {
          if (toLang === 'ja') throw new Error('Network error');
          return { text: `[${toLang}] ${_text}`, wasTranslated: true };
        },
      };

      const result = await translateSiteStrings(
        failingProvider,
        LanguageCodes.EN_US,
        'My Site',
        'My desc',
        'My tag',
      );

      // Japanese failed — should have original text, no [TODO: translate] prefix
      expect(result.siteTitle[LanguageCodes.JA].text).toBe('My Site');
      expect(result.siteTitle[LanguageCodes.JA].wasTranslated).toBe(false);
      expect(result.failedLanguages).toContain(LanguageCodes.JA);

      // French succeeded
      expect(result.siteTitle[LanguageCodes.FR].text).toBe('[fr] My Site');
      expect(result.failedLanguages).not.toContain(LanguageCodes.FR);
    });

    it('sets providerUsed to the provider name', async () => {
      const result = await translateSiteStrings(
        mockProvider,
        LanguageCodes.EN_US,
        'My Site',
        'My desc',
        'My tag',
      );

      expect(result.providerUsed).toBe('mock');
    });

    it('has no failed languages when all translations succeed', async () => {
      const result = await translateSiteStrings(
        mockProvider,
        LanguageCodes.EN_US,
        'My Site',
        'My desc',
        'My tag',
      );

      expect(result.failedLanguages).toEqual([]);
    });
  });

  describe('GoogleTranslateProvider', () => {
    const provider = new GoogleTranslateProvider();

    it('has correct metadata', () => {
      expect(provider.name).toBe('google-free');
      expect(provider.isPaid).toBe(false);
    });

    it('is always available', async () => {
      expect(await provider.isAvailable()).toBe(true);
    });

    it('returns untranslated result for empty text', async () => {
      const result = await provider.translate('', 'en', 'fr');
      expect(result.wasTranslated).toBe(false);
    });
  });

  describe('AwsTranslateProvider', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('has correct metadata', () => {
      const provider = new AwsTranslateProvider();
      expect(provider.name).toBe('aws-translate');
      expect(provider.isPaid).toBe(true);
    });

    it('is available when explicit credentials are provided', async () => {
      const provider = new AwsTranslateProvider({
        accessKeyId: 'AKIA...',
        secretAccessKey: 'secret',
      });
      expect(await provider.isAvailable()).toBe(true);
    });

    it('is available when env vars are set', async () => {
      process.env.AWS_ACCESS_KEY_ID = 'AKIA...';
      process.env.AWS_SECRET_ACCESS_KEY = 'secret';
      const provider = new AwsTranslateProvider();
      expect(await provider.isAvailable()).toBe(true);
    });

    it('returns untranslated result for empty text', async () => {
      const provider = new AwsTranslateProvider({
        accessKeyId: 'test',
        secretAccessKey: 'test',
      });
      const result = await provider.translate('  ', 'en', 'fr');
      expect(result.wasTranslated).toBe(false);
    });
  });
});
