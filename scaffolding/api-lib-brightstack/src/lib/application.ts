import {
  BrightDbApplication,
  BrightDbDatabasePlugin,
  BrightDbApiRouter,
} from '@brightchain/node-express-suite';
import {
  BaseRouter,
  DummyEmailService,
  ServiceKeys,
  IApplication,
} from '@digitaldefiance/node-express-suite';
import { Environment } from './environment';
import { IConstants } from './interfaces/constants';
import { Constants } from './constants';
import { AppRouter } from './routers/app';
import { ApiRouter } from './routers/base';
import { initMiddleware } from './middlewares';
import { PlatformID } from '@digitaldefiance/node-ecies-lib';

/**
 * Main application class.
 *
 * Uses the plugin-based architecture with BrightDbDatabasePlugin for
 * database operations. The BrightDbApplication base class provides Express
 * server, routing, and middleware support.
 *
 * This class sets up:
 * - Library's ApiRouter which provides user authentication routes
 * - App router for serving React frontend
 * - BrightDbDatabasePlugin for database initialization
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
 * const env = new Environment(join(BrightDbApplication.distDir, 'my-api', '.env'));
 * const app = new App(env);
 * await app.start();
 * ```
 */
export class App<
  TID extends PlatformID = PlatformID,
  TConstants extends IConstants = IConstants,
> extends BrightDbApplication<TID, Environment<TID>, TConstants, AppRouter> {
  /**
   * The BrightDB database plugin for accessing BrightDB-specific features.
   */
  public readonly brightDbPlugin: BrightDbDatabasePlugin<TID>;

  constructor(
    environment: Environment<TID>,
    constants: TConstants = Constants as TConstants,
  ) {
    super(
      environment,
      // Create an ApiRouter for API routes.
      // The factory runs during start(), after BrightDbDatabasePlugin.init() has set up
      // the application. For custom API routes, extend ApiRouter or use
      // decorator-based controllers (see routers/api.ts for examples).
      (app: IApplication<TID>): BrightDbApiRouter<TID> => {
        return new ApiRouter(app);
      },
      undefined, // Default CSP config
      constants,
      (apiRouter: BaseRouter<TID>): AppRouter => new AppRouter(apiRouter),
      initMiddleware,
    );

    // Register the BrightDbDatabasePlugin
    this.brightDbPlugin = new BrightDbDatabasePlugin<TID>(environment);
    this.useDatabasePlugin(this.brightDbPlugin);

    // Register the DummyEmailService - users should replace this with their own email service
    const emailService = new DummyEmailService<TID>(this);
    // const emailService = new EmailService(this);
    this.services.register(ServiceKeys.EMAIL, () => emailService);
  }
}
