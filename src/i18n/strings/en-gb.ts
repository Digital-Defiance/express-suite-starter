import { StarterStringKey } from '../starter-string-key';
import { enUsTranslations } from './en-us';

// British English uses same translations as US English
export const enGbTranslations: Record<StarterStringKey, string> = {
  ...enUsTranslations,

  // Translation
  [StarterStringKey.PROMPT_AUTO_TRANSLATE]:
    'Auto-translate site strings to other languages?',
  [StarterStringKey.TRANSLATION_PROVIDER_GOOGLE_FREE]:
    'Google Translate (free, no API key)',
  [StarterStringKey.TRANSLATION_PROVIDER_AWS]:
    'AWS Translate (uses existing AWS credentials, may incur charges)',
  [StarterStringKey.TRANSLATION_PROVIDER_AWS_ENTER_CREDS]:
    'AWS Translate (enter credentials, may incur charges)',
  [StarterStringKey.TRANSLATION_PROVIDER_SKIP]:
    'Skip (use original text with TODO markers)',
  [StarterStringKey.TRANSLATION_TRANSLATING]:
    'Translating site strings using {provider}...',
  [StarterStringKey.TRANSLATION_SUCCESS]:
    'Successfully translated site strings to {count} languages.',
  [StarterStringKey.TRANSLATION_PARTIAL_FAILURE]:
    'Translation succeeded for most languages. Failed for: {languages}',
  [StarterStringKey.TRANSLATION_FAILED_TRYING_NEXT]:
    '{provider} failed: {error}',
  [StarterStringKey.TRANSLATION_FAILED_FALLBACK]:
    'Translation unavailable. Original text will be used with [TODO: translate] markers for other languages.',
  [StarterStringKey.TRANSLATION_SKIPPED]:
    'Translation skipped. Original text will be used with [TODO: translate] markers for other languages.',
  [StarterStringKey.PROMPT_AWS_REGION]: 'AWS region:',
  [StarterStringKey.PROMPT_AWS_ACCESS_KEY_ID]: 'AWS Access Key ID:',
  [StarterStringKey.PROMPT_AWS_SECRET_ACCESS_KEY]: 'AWS Secret Access Key:',
  [StarterStringKey.PROMPT_TRY_AWS_TRANSLATE]:
    'Would you like to try AWS Translate instead? (may incur charges)',
  [StarterStringKey.NOTICE_TRANSLATIONS_AUTO_GENERATED]:
    'Translations were auto-generated. Review the strings-collection.ts file to verify quality.',
  [StarterStringKey.WARNING_TRANSLATE_TODO_LANGUAGES]:
    'The following languages need manual translation: {languages}. Search for [TODO: translate] in the generated project.',
};
