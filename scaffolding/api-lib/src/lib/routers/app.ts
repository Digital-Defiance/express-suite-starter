import { AppRouter as BaseAppRouter, BaseRouter, IApplication } from '@digitaldefiance/node-express-suite';
import { Request, Response, NextFunction } from 'express';
import { Environment } from '../environment';
import { IConstants } from '../interfaces/constants';
import { Constants } from '../constants';
import { Types } from '@digitaldefiance/mongoose-types';

export class AppRouter extends BaseAppRouter<Types.ObjectId, IApplication<Types.ObjectId>> {
  constructor(apiRouter: BaseRouter<Types.ObjectId, IApplication<Types.ObjectId>>) {
    super(apiRouter);
  }

  public override renderIndex(req: Request, res: Response, next: NextFunction): void {
    if (req.url.endsWith('.js')) {
      res.type('application/javascript');
    }

    const jsFile = this.getAssetFilename(this.assetsDir, /^index-.*\.js$/);
    const cssFile = this.getAssetFilename(this.assetsDir, /^index-.*\.css$/);
    const constants = this.application.constants as IConstants;
    const environment = this.application.environment as Environment<Types.ObjectId>;
    const SiteName = constants.Site;
    const locals = {
      ...this.getBaseViewLocals(req, res),
      title: SiteName,
      jsFile: jsFile ? `assets/${jsFile}` : undefined,
      cssFile: cssFile ? `assets/${cssFile}` : undefined,
    };

    this.renderTemplate(req, res, next, 'index', locals);
  }
}