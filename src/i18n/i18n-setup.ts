/**
 * Express Suite Starter i18n Setup
 * Uses createI18nSetup factory for proper engine initialization.
 * Supports translateStringKey for direct branded enum translation.
 */
import {
  createI18nSetup,
  I18nEngine,
  LanguageCodes,
} from '@digitaldefiance/i18n-lib';
import type { ComponentConfig, EngineConfig } from '@digitaldefiance/i18n-lib';
import { StarterStringKey } from './starter-string-key';
import {
  StarterStringKeys,
  STARTER_COMPONENT_ID,
  type StarterStringKeyValue,
} from './branded-starter-string-key';
import { allTranslations } from './translations-all';

export const StarterI18nEngineKey = 'DigitalDefiance.Starter.I18nEngine' as const;
export const StarterComponentId = STARTER_COMPONENT_ID;

/**
 * Create Starter component configuration with all translations
 */
export function createStarterComponentConfig(): ComponentConfig {
  return {
    id: StarterComponentId,
    strings: {
      [LanguageCodes.EN_US]: allTranslations['en-US'],
      [LanguageCodes.EN_GB]: allTranslations['en-GB'],
      [LanguageCodes.ES]: allTranslations['es'],
      [LanguageCodes.FR]: allTranslations['fr'],
      [LanguageCodes.DE]: allTranslations['de'],
      [LanguageCodes.ZH_CN]: allTranslations['zh-CN'],
      [LanguageCodes.JA]: allTranslations['ja'],
      [LanguageCodes.UK]: allTranslations['uk'],
    },
    aliases: ['StarterStringKey'],
  };
}

let _starterEngine: I18nEngine | undefined;

/**
 * Get or create the Starter i18n engine
 */
export function getStarterI18nEngine(config?: EngineConfig): I18nEngine {
  if (_starterEngine && I18nEngine.hasInstance('default')) {
    return _starterEngine;
  }

  const result = createI18nSetup({
    componentId: StarterComponentId,
    stringKeyEnum: StarterStringKeys,
    strings: createStarterComponentConfig().strings,
    aliases: ['StarterStringKey'],
    defaultLanguage: config?.defaultLanguage ?? LanguageCodes.EN_US,
  });

  _starterEngine = result.engine as I18nEngine;
  return _starterEngine;
}

/**
 * Proxy for backward compatibility
 */
export const starterI18nEngine = new Proxy({} as I18nEngine, {
  get(_target, prop) {
    return getStarterI18nEngine()[prop as keyof I18nEngine];
  },
});

/**
 * Reset function for tests
 */
export function resetStarterI18nEngine(): void {
  _starterEngine = undefined;
}

/**
 * Helper to translate Starter strings using translateStringKey.
 * Uses the branded enum for automatic component ID resolution.
 */
export function getStarterTranslation(
  stringKey: StarterStringKey | StarterStringKeyValue,
  variables?: Record<string, string | number>,
  language?: string,
): string {
  return getStarterI18nEngine().translateStringKey(
    stringKey,
    variables,
    language,
  );
}

/**
 * Safe translation with fallback using safeTranslateStringKey.
 */
export function safeStarterTranslation(
  stringKey: StarterStringKey | StarterStringKeyValue,
  variables?: Record<string, string | number>,
  language?: string,
): string {
  return getStarterI18nEngine().safeTranslateStringKey(
    stringKey,
    variables,
    language,
  );
}
