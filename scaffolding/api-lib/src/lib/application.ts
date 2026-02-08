import {
  Application,
  BaseApplication,
  IFailableResult,
  IServerInitResult,
  DummyEmailService,
  emailServiceRegistry,
  BaseRouter,
  IApplication,
  ApiRouter as LibraryApiRouter,
} from '@digitaldefiance/node-express-suite';
import { Environment } from './environment';
import { IConstants } from './interfaces/constants';
import { Constants } from './constants';
import { AppRouter } from './routers/app';
import { getSchemaMap } from './schemas/schema';
import { initMiddleware } from './middlewares';
import { EmailService } from './services/email';
import { Types } from '@digitaldefiance/mongoose-types';
import { ModelDocMap } from './shared-types';

/**
 * Main application class.
 * 
 * This class sets up the Express application with:
 * - Library's ApiRouter which provides user authentication routes
 * - App router for serving React frontend
 * - Database initialization
 * - Email service registration
 * 
 * Note: The library's ApiRouter includes UserController which provides:
 * - /api/user/verify - Token verification
 * - /api/user/request-direct-login - Direct login request
 * - /api/user/login - User login
 * - And other user management endpoints
 * 
 * For custom API routes, create additional decorator-based controllers
 * and mount them on the router.
 * 
 * @example
 * ```typescript
 * const env = new Environment(join(App.distDir, 'my-api', '.env'));
 * const app = new App(
 *   env,
 *   DatabaseInitializationService.initUserDb.bind(DatabaseInitializationService),
 *   DatabaseInitializationService.serverInitResultHash.bind(DatabaseInitializationService),
 *   Constants,
 * );
 * await app.start();
 * ```
 */
export class App<
  TInitResults extends IServerInitResult<Types.ObjectId> = IServerInitResult<Types.ObjectId>,
  TConstants extends IConstants = IConstants,
> extends Application<TInitResults, ModelDocMap, Types.ObjectId, Environment<Types.ObjectId>, TConstants, AppRouter> {
  constructor(
    environment: Environment<Types.ObjectId>,
    databaseInitFunction: (
      application: BaseApplication<Types.ObjectId, ModelDocMap, TInitResults>,
    ) => Promise<IFailableResult<TInitResults>>,
    initResultHashFunction: (initResults: TInitResults) => string,
    constants: TConstants = Constants as TConstants,
  ) {
    super(
      environment,
      // Use the library's ApiRouter which includes UserController for auth routes
      (app: IApplication<Types.ObjectId>): BaseRouter<Types.ObjectId> => {
        return new LibraryApiRouter(app);
      },
      getSchemaMap,
      databaseInitFunction,
      initResultHashFunction,
      undefined, // Default CSP config
      constants,
      (apiRouter: BaseRouter<Types.ObjectId>): AppRouter => new AppRouter(apiRouter),
      initMiddleware,
    );

    // Register the DummyEmailService - users should replace this with their own email service
    const emailService = new DummyEmailService<Types.ObjectId>(this);
    // const emailService = new EmailService(this);
    emailServiceRegistry.setService(emailService);
  }
}
