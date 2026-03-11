import {
  BrightDbApiRouter,
  IBrightDbApplication,
} from '@brightchain/node-express-suite';
import { PlatformID } from '@digitaldefiance/node-ecies-lib';
import { CustomApiController } from './api';

/**
 * Concrete API router for BrightStack applications.
 *
 * Extends BrightDbApiRouter from @brightchain/node-express-suite which
 * provides user authentication routes (register, login, verify, profile,
 * settings, change-password, recover, logout, request-direct-login,
 * refresh-token) out of the box.
 *
 * Add your own controllers here alongside the built-in user routes.
 */
export class ApiRouter<
  TID extends PlatformID = PlatformID,
  TApplication extends IBrightDbApplication<TID> = IBrightDbApplication<TID>,
> extends BrightDbApiRouter<TID, TApplication> {
  private readonly customApiController: CustomApiController<TID>;

  constructor(application: TApplication) {
    super(application);

    // Instantiate and mount custom controllers alongside the built-in user routes
    this.customApiController = new CustomApiController(application);
    this.router.use('/custom', this.customApiController.router);
  }
}
