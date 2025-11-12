import { IEnvironment as IBaseEnvironment } from '@digitaldefiance/node-express-suite';
import { IEnvironmentAws } from './environment-aws';

export interface IEnvironment extends IBaseEnvironment {
  /**
   * AWS configuration
   */
  aws: IEnvironmentAws;
}
