import { IConstants as ISuiteCoreConstants } from '@digitaldefiance/suite-core-lib';

export interface IConstants extends ISuiteCoreConstants {
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
