import { IConstants as IBaseConstants } from '@digitaldefiance/node-express-suite';

export interface IConstants extends IBaseConstants {
  readonly Site: string;
  readonly SiteTagline: string;
  readonly SiteDescription: string;
  readonly PasswordRegex: RegExp;
}
