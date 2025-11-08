import {
  I18nEngine,
  LanguageCodes,
  createDefaultLanguages,
  createCoreComponentRegistration,
} from '@digitaldefiance/i18n-lib';
import type { ComponentConfig, EngineConfig } from '@digitaldefiance/i18n-lib';
import { StarterStringKey } from './starter-string-key';
import { allTranslations } from './translations-all';

export const StarterI18nEngineKey = 'DigitalDefiance.Starter.I18nEngine' as const;
export const StarterComponentId = 'express-suite-starter' as const;

export function createStarterComponentConfig(): ComponentConfig {
  const translations: Record<string, Record<StarterStringKey, string>> = {
    [LanguageCodes.EN_US]: allTranslations['en-US'],
    [LanguageCodes.EN_GB]: allTranslations['en-GB'],
    [LanguageCodes.ES]: allTranslations['es'],
    [LanguageCodes.FR]: allTranslations['fr'],
    [LanguageCodes.DE]: allTranslations['de'],
    [LanguageCodes.ZH_CN]: allTranslations['zh-CN'],
    [LanguageCodes.JA]: allTranslations['ja'],
    [LanguageCodes.UK]: allTranslations['uk'],
  };

  return {
    id: StarterComponentId,
    strings: translations,
  };
}

let _starterEngine: I18nEngine | undefined;

export function getStarterI18nEngine(config?: EngineConfig): I18nEngine {
  if (!_starterEngine || !I18nEngine.hasInstance('default')) {
    const engine = I18nEngine.registerIfNotExists('default', createDefaultLanguages(), config);
    
    const coreReg = createCoreComponentRegistration();
    engine.registerIfNotExists({
      id: coreReg.component.id,
      strings: coreReg.strings as Record<string, Record<string, string>>,
    });
    
    const starterConfig = createStarterComponentConfig();
    const result = engine.registerIfNotExists({
      ...starterConfig,
      aliases: ['StarterStringKey'],
    });
    
    if (!result.isValid && result.errors.length > 0) {
      console.warn(`Starter component has ${result.errors.length} errors`, result.errors.slice(0, 5));
    }
    
    _starterEngine = engine;
  }
  return _starterEngine;
}

export const starterI18nEngine = new Proxy({} as I18nEngine, {
  get(target, prop) {
    return getStarterI18nEngine()[prop as keyof I18nEngine];
  },
});

export function resetStarterI18nEngine(): void {
  _starterEngine = undefined;
}

export function getStarterTranslation(
  stringKey: StarterStringKey,
  variables?: Record<string, string | number>,
  language?: string,
): string {
  return getStarterI18nEngine().translate(StarterComponentId, stringKey, variables, language);
}

export function safeStarterTranslation(
  stringKey: StarterStringKey,
  variables?: Record<string, string | number>,
  language?: string,
): string {
  try {
    return getStarterTranslation(stringKey, variables, language);
  } catch {
    return `[${stringKey}]`;
  }
}
