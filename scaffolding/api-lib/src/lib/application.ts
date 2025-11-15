import { Application, BaseApplication, IFailableResult, IServerInitResult, DummyEmailService, emailServiceRegistry, BaseRouter, IApplication } from '@digitaldefiance/node-express-suite';
import { Environment } from './environment';
import { IConstants } from './interfaces/constants';
import { Constants } from './constants';
import { ApiRouter } from './routers/api';
import { AppRouter } from './routers/app';
import { getSchemaMap } from './schemas/schema';
import { initMiddleware } from './middlewares';
import { EmailService } from './services/email';

export class App<TInitResults extends IServerInitResult = IServerInitResult, TConstants extends IConstants = IConstants> extends Application<TInitResults, any, Environment, TConstants, any> {
  constructor(
    environment: Environment,
    databaseInitFunction: (application: BaseApplication<any, TInitResults>) => Promise<IFailableResult<TInitResults>>,
    initResultHashFunction: (initResults: TInitResults) => string,
    constants: TConstants = Constants as TConstants,
  ) {
    super(
      environment, 
      (app: IApplication): BaseRouter<IApplication> => new ApiRouter(app), 
      getSchemaMap,
      databaseInitFunction, 
      initResultHashFunction, 
      undefined, // Default CSP config
      constants,
      (apiRouter: BaseRouter<IApplication>): AppRouter => new AppRouter(apiRouter),
      initMiddleware,
    );
    
    // Register the DummyEmailService - users should replace this with their own email service
    const emailService = new DummyEmailService(this);
    //const emailService = new EmailService(this);
    emailServiceRegistry.setService(emailService);
  }
}
