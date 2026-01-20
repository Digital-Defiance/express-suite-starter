import { ApiRouter as BaseApiRouter, IApplication, IBaseDocument } from '@digitaldefiance/node-express-suite';
import { ITokenRole, ITokenUser, IUserBase } from '@digitaldefiance/suite-core-lib';
import { Types } from '@digitaldefiance/mongoose-types';
import { Environment } from '../environment';
import { IConstants } from '../interfaces/constants';
import { CoreLanguageCode } from '@digitaldefiance/i18n-lib';

export class ApiRouter<
  TID extends Types.ObjectId | string = Types.ObjectId,
  TDate extends Date = Date,
  TLanguage extends CoreLanguageCode = CoreLanguageCode,
  TAccountStatus extends string = string,
  TUser extends IUserBase<TID, TDate, TLanguage, TAccountStatus> = IUserBase<TID, TDate, TLanguage, TAccountStatus>,
  TTokenRole extends ITokenRole<TID, TDate> = ITokenRole<TID, TDate>,
  TTokenUser extends ITokenUser = ITokenUser,
  TEnvironment extends Environment<TID> = Environment<TID>,
  TConstants extends IConstants = IConstants,
  TBaseDocument extends IBaseDocument<any, TID> = IBaseDocument<any, TID>,
  TApplication extends IApplication<TID> = IApplication<TID>,
> extends BaseApiRouter<TID,TDate,TLanguage,TAccountStatus, TUser,TTokenRole,TBaseDocument, TTokenUser,TConstants, TEnvironment, TApplication> {
  constructor(app: TApplication) {
    super(app);
  }
}