import {
  BaseRouter,
  IApplication,
} from '@digitaldefiance/node-express-suite';
import { PlatformID } from '@digitaldefiance/node-ecies-lib';

/**
 * Concrete API router for BrightStack applications.
 *
 * Extends the abstract BaseRouter from @digitaldefiance/node-express-suite
 * to provide a concrete router that can be instantiated without Mongoose
 * dependencies. Mount decorator-based controllers on this router for
 * custom API endpoints.
 */
export class ApiRouter<
  TID extends PlatformID = PlatformID,
  TApplication extends IApplication<TID> = IApplication<TID>,
> extends BaseRouter<TID, TApplication> {
  constructor(application: TApplication) {
    super(application);
  }
}
