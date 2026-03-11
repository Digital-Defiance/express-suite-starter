import { AppRouter as BaseAppRouter, BaseRouter, IApplication } from '@digitaldefiance/node-express-suite';
import { PlatformID } from '@digitaldefiance/node-ecies-lib';

export class AppRouter extends BaseAppRouter<PlatformID, IApplication<PlatformID>> {
  constructor(apiRouter: BaseRouter<PlatformID, IApplication<PlatformID>>) {
    super(apiRouter);
  }
}
