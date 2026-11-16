import { AccountStatus, IUserBase } from '@digitaldefiance/suite-core-lib';
import { BaseDocument } from '@digitaldefiance/node-express-suite-mongo';
import { CoreLanguageCode } from '@digitaldefiance/i18n-lib';
import { PlatformID } from '@digitaldefiance/node-ecies-lib';

/**
 * Composite interface for user collection documents
 */
export type IUserDocument<
  TID extends PlatformID = PlatformID,
  TDate extends Date = Date,
  TLanguage extends string = CoreLanguageCode,
  TAccountStatus extends AccountStatus = AccountStatus,
> = BaseDocument<IUserBase<TID, TDate, TLanguage, TAccountStatus>>;
