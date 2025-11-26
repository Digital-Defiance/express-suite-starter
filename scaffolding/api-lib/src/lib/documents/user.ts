import { Types } from '@digitaldefiance/mongoose-types';
import { AccountStatus, IUserBase } from '@digitaldefiance/suite-core-lib';
import { IBaseDocument } from '@digitaldefiance/node-express-suite';
import { CoreLanguageCode } from '@digitaldefiance/i18n-lib';

/**
 * Composite interface for user collection documents
 */
export interface IUserDocument<I = Types.ObjectId, D extends Date = Date, S extends string = CoreLanguageCode, A extends AccountStatus = AccountStatus> extends IBaseDocument<
  IUserBase<
    I,
    D,
    S,
    A
  >
> {
}
