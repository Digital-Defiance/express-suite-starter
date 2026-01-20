import { Types } from '@digitaldefiance/mongoose-types';
import { AccountStatus, IUserBase } from '@digitaldefiance/suite-core-lib';
import { IBaseDocument } from '@digitaldefiance/node-express-suite';
import { CoreLanguageCode } from '@digitaldefiance/i18n-lib';
import { PlatformID } from '@digitaldefiance/node-ecies-lib';

/**
 * Composite interface for user collection documents
 */
export interface IUserDocument<TID extends PlatformID = PlatformID, TDate extends Date = Date, TLanguage extends string = CoreLanguageCode, TAccountStatus extends AccountStatus = AccountStatus> extends IBaseDocument<
  IUserBase<
    TID,
    TDate,
    TLanguage,
    TAccountStatus
  >
> {
}
