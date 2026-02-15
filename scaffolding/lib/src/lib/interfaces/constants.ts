import { IConstants as ISuiteCoreConstants } from '@digitaldefiance/suite-core-lib';
import type { ISuiteCoreI18nConstants } from '@digitaldefiance/suite-core-lib';

/**
 * Application constants interface.
 * Extends ISuiteCoreConstants for general app config and
 * ISuiteCoreI18nConstants for type-safe i18n template variables.
 */
export interface IConstants extends ISuiteCoreConstants, ISuiteCoreI18nConstants {
  readonly Site: string;
  readonly SiteTagline: string;
  readonly SiteDescription: string;
  readonly SiteHostname: string;
  readonly PasswordRegex: RegExp;
  readonly UsernameMinLength: number;
  readonly UsernameMaxLength: number;
  readonly UsernameRegex: RegExp;
  readonly PasswordMinLength: number;
}
