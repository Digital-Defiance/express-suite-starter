import { Application, BaseApplication, IFailableResult, IServerInitResult } from '@digitaldefiance/node-express-suite';
import { Environment } from './environment';
import { IConstants } from './interfaces/constants';
import { Constants } from './constants';

export class App<TInitResults = IServerInitResult, TConstants extends IConstants = IConstants> extends Application<TInitResults, any, Environment, TConstants, any> {
  constructor(
    environment: Environment,
    databaseInitFunction: (application: BaseApplication<any, TInitResults>) => Promise<IFailableResult<TInitResults>>,
    initResultHashFunction: (initResults: TInitResults) => string,
    constants: TConstants = Constants as TConstants,
  ) {
    super(environment, undefined, () => ({}), databaseInitFunction, initResultHashFunction, undefined, constants);
  }
}
