import {
  Application,
  MongoDatabasePlugin,
  DummyEmailService,
  emailServiceRegistry,
  BaseRouter,
  IApplication,
  IMongoApplication,
  ApiRouter as LibraryApiRouter,
  IServerInitResult,
  IFailableResult,
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
 * Uses the plugin-based architecture with MongoDatabasePlugin for
 * database operations. The Application base class provides Express
 * server, routing, and middleware support.
 *
 * This class sets up:
 * - Library's ApiRouter which provides user authentication routes
 * - App router for serving React frontend
 * - MongoDatabasePlugin for database initialization
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
> extends Application<Types.ObjectId, Environment<Types.ObjectId>, TConstants, AppRouter> {
  /**
   * The Mongo database plugin for accessing Mongoose-specific features.
   */
  public readonly mongoPlugin: MongoDatabasePlugin<
    Types.ObjectId,
    ModelDocMap,
    TInitResults,
    TConstants
  >;

  constructor(
    environment: Environment<Types.ObjectId>,
    databaseInitFunction: (
      application: IMongoApplication<Types.ObjectId>,
    ) => Promise<IFailableResult<TInitResults>>,
    initResultHashFunction: (initResults: TInitResults) => string,
    constants: TConstants = Constants as TConstants,
  ) {
    super(
      environment,
      // Use the library's ApiRouter which includes UserController for auth routes.
      // The factory runs during start(), after MongoDatabasePlugin.init() has created
      // the mongoApplication adapter. We use that adapter (which properly implements
      // IMongoApplication with db/getModel) instead of casting the raw Application.
      (_app: IApplication<Types.ObjectId>): BaseRouter<Types.ObjectId> => {
        const mongoApp = this.mongoPlugin.mongoApplication;
        if (!mongoApp) {
          throw new Error(
            'MongoDatabasePlugin has not been initialized yet. ' +
            'Ensure useDatabasePlugin() is called before start().',
          );
        }
        return new LibraryApiRouter(mongoApp);
      },
      undefined, // Default CSP config
      constants,
      (apiRouter: BaseRouter<Types.ObjectId>): AppRouter => new AppRouter(apiRouter),
      initMiddleware,
    );

    // Register the MongoDatabasePlugin
    this.mongoPlugin = new MongoDatabasePlugin({
      schemaMapFactory: getSchemaMap,
      databaseInitFunction,
      initResultHashFunction,
      environment,
      constants,
    });
    this.useDatabasePlugin(this.mongoPlugin);

    // Register the DummyEmailService - users should replace this with their own email service
    const emailService = new DummyEmailService<Types.ObjectId>(this);
    // const emailService = new EmailService(this);
    emailServiceRegistry.setService(emailService);
  }
}
