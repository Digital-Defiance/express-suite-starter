/**
 * Translation service for auto-translating site strings during scaffolding.
 *
 * Provider chain (user always chooses):
 * 1. Google Translate (free, no API key)
 * 2. AWS Translate (auto-detect or prompt for credentials, may incur charges)
 * 3. Skip: user's original input in all languages, with TODO comments in generated code
 *
 * The user is ALWAYS asked before using any paid service.
 */

import { LanguageCodes } from '@digitaldefiance/i18n-lib';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';

// ─── Types ───────────────────────────────────────────────────────────

/** Result of translating a single string */
export interface TranslationResult {
  text: string;
  wasTranslated: boolean;
}

/** Per-language site string translations */
export interface SiteStringsTranslations {
  siteTitle: Record<string, TranslationResult>;
  siteDescription: Record<string, TranslationResult>;
  siteTagline: Record<string, TranslationResult>;
  /** Languages where translation failed */
  failedLanguages: string[];
  /** Provider that succeeded, or 'none' */
  providerUsed: string;
}

/** Provider interface for translation backends */
export interface TranslationProvider {
  readonly name: string;
  readonly displayName: string;
  readonly isPaid: boolean;
  /** Check if this provider is available (e.g. credentials exist) */
  isAvailable(): Promise<boolean>;
  translate(
    text: string,
    fromLang: string,
    toLang: string,
  ): Promise<TranslationResult>;
}


// ─── Language mapping ────────────────────────────────────────────────

/** Map i18n-lib codes to BCP-47 codes used by translation APIs */
const LANGUAGE_API_MAP: Record<string, string> = {
  [LanguageCodes.EN_US]: 'en',
  [LanguageCodes.EN_GB]: 'en',
  [LanguageCodes.FR]: 'fr',
  [LanguageCodes.ES]: 'es',
  [LanguageCodes.DE]: 'de',
  [LanguageCodes.ZH_CN]: 'zh-CN',
  [LanguageCodes.JA]: 'ja',
  [LanguageCodes.UK]: 'uk',
};

/**
 * Get the API language code for an i18n language code.
 */
export function getApiLanguageCode(i18nCode: string): string {
  return LANGUAGE_API_MAP[i18nCode] ?? i18nCode;
}

/**
 * Check if two i18n language codes are in the same language family
 * (e.g. en-US and en-GB are both English).
 */
export function isSameFamily(langA: string, langB: string): boolean {
  const apiA = getApiLanguageCode(langA);
  const apiB = getApiLanguageCode(langB);
  return apiA === apiB;
}

// ─── All supported target languages ─────────────────────────────────

export const ALL_TARGET_LANGUAGES: string[] = [
  LanguageCodes.EN_US,
  LanguageCodes.EN_GB,
  LanguageCodes.FR,
  LanguageCodes.ES,
  LanguageCodes.DE,
  LanguageCodes.ZH_CN,
  LanguageCodes.JA,
  LanguageCodes.UK,
];


// ─── Google Translate Provider (free, no API key) ────────────────────

/**
 * Uses the undocumented Google Translate web API.
 * No API key required. Suitable for translating a handful of short strings.
 * May break if Google changes their endpoint.
 */
export class GoogleTranslateProvider implements TranslationProvider {
  readonly name = 'google-free';
  readonly displayName = 'Google Translate (free, no API key)';
  readonly isPaid = false;

  async isAvailable(): Promise<boolean> {
    return true; // Always available to try
  }

  async translate(
    text: string,
    fromLang: string,
    toLang: string,
  ): Promise<TranslationResult> {
    if (!text.trim()) {
      return { text, wasTranslated: false };
    }

    const encodedText = encodeURIComponent(text);
    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodedText}`;

    return new Promise<TranslationResult>((resolve, reject) => {
      const req = https.get(url, { timeout: 10000 }, (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              reject(
                new Error(
                  `Google Translate returned status ${res.statusCode}`,
                ),
              );
              return;
            }
            const parsed = JSON.parse(data);
            // Response format: [[["translated text","original text",null,null,10]],null,"en",...]
            const translated = parsed?.[0]
              ?.map((segment: string[]) => segment[0])
              .join('');
            if (translated) {
              resolve({ text: translated, wasTranslated: true });
            } else {
              reject(new Error('Empty translation response'));
            }
          } catch (err) {
            reject(
              new Error(
                `Failed to parse Google Translate response: ${err instanceof Error ? err.message : String(err)}`,
              ),
            );
          }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Google Translate request timed out'));
      });
    });
  }
}


// ─── AWS Translate Provider ──────────────────────────────────────────

/**
 * Uses AWS Translate via @aws-sdk/client-translate.
 * Dynamically imports the SDK so it's not a hard dependency.
 * Checks for existing AWS credentials before attempting.
 */
export class AwsTranslateProvider implements TranslationProvider {
  readonly name = 'aws-translate';
  readonly displayName = 'AWS Translate (may incur charges)';
  readonly isPaid = true;

  private region: string;
  private accessKeyId?: string;
  private secretAccessKey?: string;

  constructor(options?: {
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
  }) {
    this.region = options?.region ?? process.env.AWS_REGION ?? 'us-east-1';
    this.accessKeyId = options?.accessKeyId;
    this.secretAccessKey = options?.secretAccessKey;
  }

  async isAvailable(): Promise<boolean> {
    // Check if credentials are available via env vars or explicit config
    if (this.accessKeyId && this.secretAccessKey) {
      return true;
    }
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      return true;
    }
    // Check for ~/.aws/credentials file
    const credPath = path.join(
      process.env.HOME ?? process.env.USERPROFILE ?? '',
      '.aws',
      'credentials',
    );
    try {
      await fs.promises.access(credPath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  async translate(
    text: string,
    fromLang: string,
    toLang: string,
  ): Promise<TranslationResult> {
    if (!text.trim()) {
      return { text, wasTranslated: false };
    }

    // Map some BCP-47 codes to AWS Translate codes
    const awsLangMap: Record<string, string> = {
      'zh-CN': 'zh',
    };
    const awsFrom = awsLangMap[fromLang] ?? fromLang;
    const awsTo = awsLangMap[toLang] ?? toLang;

    try {
      // Dynamic require — not a hard dependency.
      // Jest needs @aws-sdk in transformIgnorePatterns to avoid VM issues.
       
      const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');

      const clientConfig: Record<string, unknown> = { region: this.region };
      if (this.accessKeyId && this.secretAccessKey) {
        clientConfig.credentials = {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        };
      }

      const client = new TranslateClient(clientConfig);
      const command = new TranslateTextCommand({
        Text: text,
        SourceLanguageCode: awsFrom,
        TargetLanguageCode: awsTo,
      });

      const response = await client.send(command);
      if (response.TranslatedText) {
        return { text: response.TranslatedText, wasTranslated: true };
      }
      return { text, wasTranslated: false };
    } catch (err) {
      throw new Error(
        `AWS Translate failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}


// ─── Translation orchestrator ────────────────────────────────────────

/**
 * Translate site strings to all target languages using the given provider.
 * For same-family languages (e.g. en-US → en-GB), copies verbatim.
 * On per-language failure, marks that language as failed and uses fallback.
 */
export async function translateSiteStrings(
  provider: TranslationProvider,
  sourceLang: string,
  siteTitle: string,
  siteDescription: string,
  siteTagline: string,
): Promise<SiteStringsTranslations> {
  const sourceApiLang = getApiLanguageCode(sourceLang);
  const failedLanguages: string[] = [];

  const result: SiteStringsTranslations = {
    siteTitle: {},
    siteDescription: {},
    siteTagline: {},
    failedLanguages,
    providerUsed: provider.name,
  };

  for (const targetLang of ALL_TARGET_LANGUAGES) {
    // Source language: use the user's input directly
    if (targetLang === sourceLang) {
      result.siteTitle[targetLang] = { text: siteTitle, wasTranslated: false };
      result.siteDescription[targetLang] = {
        text: siteDescription,
        wasTranslated: false,
      };
      result.siteTagline[targetLang] = {
        text: siteTagline,
        wasTranslated: false,
      };
      continue;
    }

    // Same family (e.g. en-US and en-GB): copy verbatim
    if (isSameFamily(sourceLang, targetLang)) {
      result.siteTitle[targetLang] = { text: siteTitle, wasTranslated: false };
      result.siteDescription[targetLang] = {
        text: siteDescription,
        wasTranslated: false,
      };
      result.siteTagline[targetLang] = {
        text: siteTagline,
        wasTranslated: false,
      };
      continue;
    }

    // Translate each string individually
    const targetApiLang = getApiLanguageCode(targetLang);
    try {
      const [titleResult, descResult, taglineResult] = await Promise.all([
        provider.translate(siteTitle, sourceApiLang, targetApiLang),
        provider.translate(siteDescription, sourceApiLang, targetApiLang),
        provider.translate(siteTagline, sourceApiLang, targetApiLang),
      ]);
      result.siteTitle[targetLang] = titleResult;
      result.siteDescription[targetLang] = descResult;
      result.siteTagline[targetLang] = taglineResult;
    } catch {
      // Translation failed for this language — use original text as fallback
      failedLanguages.push(targetLang);
      result.siteTitle[targetLang] = {
        text: siteTitle,
        wasTranslated: false,
      };
      result.siteDescription[targetLang] = {
        text: siteDescription,
        wasTranslated: false,
      };
      result.siteTagline[targetLang] = {
        text: siteTagline,
        wasTranslated: false,
      };
    }
  }

  return result;
}

/**
 * Build fallback translations (no translation attempted).
 * Same-family languages get verbatim copy, others get the original text
 * and are marked in failedLanguages for TODO comment generation.
 */
export function buildFallbackTranslations(
  sourceLang: string,
  siteTitle: string,
  siteDescription: string,
  siteTagline: string,
): SiteStringsTranslations {
  const result: SiteStringsTranslations = {
    siteTitle: {},
    siteDescription: {},
    siteTagline: {},
    failedLanguages: [],
    providerUsed: 'none',
  };

  for (const targetLang of ALL_TARGET_LANGUAGES) {
    if (targetLang === sourceLang || isSameFamily(sourceLang, targetLang)) {
      result.siteTitle[targetLang] = { text: siteTitle, wasTranslated: false };
      result.siteDescription[targetLang] = {
        text: siteDescription,
        wasTranslated: false,
      };
      result.siteTagline[targetLang] = {
        text: siteTagline,
        wasTranslated: false,
      };
    } else {
      result.failedLanguages.push(targetLang);
      result.siteTitle[targetLang] = {
        text: siteTitle,
        wasTranslated: false,
      };
      result.siteDescription[targetLang] = {
        text: siteDescription,
        wasTranslated: false,
      };
      result.siteTagline[targetLang] = {
        text: siteTagline,
        wasTranslated: false,
      };
    }
  }

  return result;
}


// ─── Mustache variable helpers ───────────────────────────────────────

/**
 * Map from i18n language code to the suffix used in mustache variable names.
 * e.g. LanguageCodes.EN_US → 'EnUs', LanguageCodes.ZH_CN → 'ZhCn'
 */
const LANG_SUFFIX_MAP: Record<string, string> = {
  [LanguageCodes.EN_US]: 'EnUs',
  [LanguageCodes.EN_GB]: 'EnGb',
  [LanguageCodes.FR]: 'Fr',
  [LanguageCodes.ES]: 'Es',
  [LanguageCodes.DE]: 'De',
  [LanguageCodes.ZH_CN]: 'ZhCn',
  [LanguageCodes.JA]: 'Ja',
  [LanguageCodes.UK]: 'Uk',
};

/**
 * Convert SiteStringsTranslations into a flat Record<string, string>
 * suitable for mustache template variables.
 *
 * Produces keys like: siteTitleEnUs, siteDescriptionFr, siteTaglineJa, etc.
 *
 * @param translations - The translation results
 * @param escapeForTs - Function to escape strings for TypeScript string literals
 */
export function translationsToMustacheVars(
  translations: SiteStringsTranslations,
  escapeForTs: (s: string) => string,
): Record<string, string | boolean> {
  const vars: Record<string, string | boolean> = {};

  for (const lang of ALL_TARGET_LANGUAGES) {
    const suffix = LANG_SUFFIX_MAP[lang];
    if (!suffix) continue;

    const titleResult = translations.siteTitle[lang];
    const descResult = translations.siteDescription[lang];
    const taglineResult = translations.siteTagline[lang];

    vars[`siteTitle${suffix}`] = escapeForTs(titleResult?.text ?? '');
    vars[`siteDescription${suffix}`] = escapeForTs(descResult?.text ?? '');
    vars[`siteTagline${suffix}`] = escapeForTs(taglineResult?.text ?? '');

    // True if this language needs manual translation (failed or skipped)
    const needsIt = translations.failedLanguages.includes(lang);
    vars[`needsTranslation${suffix}`] = needsIt;
  }

  return vars;
}
