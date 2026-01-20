import { IEnvironment as IBaseEnvironment } from '@digitaldefiance/node-express-suite';
import { IEnvironmentAws } from './environment-aws';
import { PlatformID } from '@digitaldefiance/node-ecies-lib';

export interface IEnvironment<TID extends PlatformID> extends IBaseEnvironment<TID> {
  /**
   * AWS configuration
   */
  aws: IEnvironmentAws;
}
