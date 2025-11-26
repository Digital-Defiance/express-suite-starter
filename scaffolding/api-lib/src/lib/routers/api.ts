import { ApiRouter as BaseApiRouter, IApplication, IBaseDocument } from '@digitaldefiance/node-express-suite';
import { ITokenRole, ITokenUser, IUserBase } from '@digitaldefiance/suite-core-lib';
import { Types } from '@digitaldefiance/mongoose-types';
import { Environment } from '../environment';
import { IConstants } from '../interfaces/constants';

export class ApiRouter<
  I extends Types.ObjectId | string = Types.ObjectId,
  D extends Date = Date,
  S extends string = string,
  A extends string = string,
  TUser extends IUserBase<I, D, S, A> = IUserBase<I, D, S, A>,
  TTokenRole extends ITokenRole<I, D> = ITokenRole<I, D>,
  TTokenUser extends ITokenUser = ITokenUser,
  TEnvironment extends Environment = Environment,
  TConstants extends IConstants = IConstants,
  TBaseDocument extends IBaseDocument<any, Types.ObjectId> = IBaseDocument<any, Types.ObjectId>,
  TApplication extends IApplication = IApplication,
> extends BaseApiRouter<I,D,S,A, TUser,TTokenRole,TBaseDocument, TTokenUser,TConstants, TEnvironment, TApplication> {
  constructor(app: TApplication) {
    super(app);
  }
}