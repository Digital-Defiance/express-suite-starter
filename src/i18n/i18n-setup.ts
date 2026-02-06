/**
 * Express Suite Starter i18n Setup
 * Uses I18nBuilder pattern for proper engine initialization.
 * Supports translateStringKey for direct branded enum translation.
 */
import {
  I18nBuilder,
  I18nEngine,
  LanguageCodes,
  createCoreComponentRegistration,
  getCoreLanguageDefinitions,
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
let _componentRegistered = false;

/**
 * Register the engine with all required components using I18nBuilder
 */
function registerEngine(config?: EngineConfig): I18nEngine {
  const newEngine = I18nBuilder.create()
    .withLanguages(getCoreLanguageDefinitions())
    .withDefaultLanguage(config?.defaultLanguage ?? LanguageCodes.EN_US)
    .withInstanceKey('default')
    .withStringKeyEnum(StarterStringKeys)
    .build();

  // Register Core i18n component (required for error messages)
  const coreReg = createCoreComponentRegistration();
  newEngine.register({
    id: coreReg.component.id,
    strings: coreReg.strings as Record<string, Record<string, string>>,
  });

  // Register Starter component
  const starterConfig = createStarterComponentConfig();
  const result = newEngine.registerIfNotExists(starterConfig);

  if (!result.isValid && result.errors.length > 0) {
    console.warn(
      `Starter component has ${result.errors.length} errors`,
      result.errors.slice(0, 5),
    );
  }

  return newEngine;
}

/**
 * Get or create the Starter i18n engine
 */
export function getStarterI18nEngine(config?: EngineConfig): I18nEngine {
  if (I18nEngine.hasInstance('default')) {
    _starterEngine = I18nEngine.getInstance('default');

    // Ensure our component is registered on existing instance
    if (!_componentRegistered) {
      _starterEngine.registerIfNotExists(createStarterComponentConfig());

      // Register branded string key enum for translateStringKey support
      if (!_starterEngine.hasStringKeyEnum(StarterStringKeys)) {
        _starterEngine.registerStringKeyEnum(StarterStringKeys);
      }

      _componentRegistered = true;
    }
  } else if (!_starterEngine) {
    _starterEngine = registerEngine(config);
    _componentRegistered = true;
  }
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
  _componentRegistered = false;
}

/**
 * Helper to translate Starter strings using translateStringKey.
 * Uses the branded enum for automatic component ID resolution.
 * 
 * @param stringKey - Can be either the plain StarterStringKey enum or StarterStringKeyValue
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
 * 
 * @param stringKey - Can be either the plain StarterStringKey enum or StarterStringKeyValue
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
