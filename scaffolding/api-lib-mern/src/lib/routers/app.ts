import { AppRouter as BaseAppRouter, BaseRouter, IApplication } from '@digitaldefiance/node-express-suite';
import { Types } from '@digitaldefiance/mongoose-types';

export class AppRouter extends BaseAppRouter<Types.ObjectId, IApplication<Types.ObjectId>> {
  constructor(apiRouter: BaseRouter<Types.ObjectId, IApplication<Types.ObjectId>>) {
    super(apiRouter);
  }
}