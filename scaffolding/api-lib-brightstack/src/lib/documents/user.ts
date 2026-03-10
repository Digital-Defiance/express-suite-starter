import { AccountStatus, IUserBase } from '@digitaldefiance/suite-core-lib';
import { CoreLanguageCode } from '@digitaldefiance/i18n-lib';
import { PlatformID } from '@digitaldefiance/node-ecies-lib';

/**
 * Composite interface for user documents in BrightDB.
 * Unlike the MERN variant, this does not extend a Mongoose BaseDocument.
 * Instead it directly describes the user data shape stored in BrightDB collections.
 */
export interface IUserDocument<
  TID extends PlatformID = PlatformID,
  TDate extends Date = Date,
  TLanguage extends string = CoreLanguageCode,
  TAccountStatus extends AccountStatus = AccountStatus,
> extends IUserBase<TID, TDate, TLanguage, TAccountStatus> {
  /** Unique document identifier */
  _id?: TID;
  /** Creation timestamp */
  createdAt?: TDate;
  /** Last update timestamp */
  updatedAt?: TDate;
}
