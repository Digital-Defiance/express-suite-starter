import { SecureString } from '@digitaldefiance/ecies-lib';
import { Environment as BaseEnvironment, emailServiceRegistry } from '@digitaldefiance/node-express-suite';
import { IEnvironment } from './interfaces/environment';
import { IEnvironmentAws } from './interfaces/environment-aws';
import { Constants } from './constants';
import { getSuiteCoreTranslation, SuiteCoreStringKey } from '@digitaldefiance/suite-core-lib';
import { EmailService } from './services/email';
import { PlatformID } from '@digitaldefiance/node-ecies-lib';

export class Environment<TID extends PlatformID> extends BaseEnvironment<TID> implements IEnvironment<TID> {
  private _aws: IEnvironmentAws;

  constructor(path?: string, initialization = false, override = true) {
    super(path, initialization, override, Constants);
    const envObj = this.getObject();
    
    this._aws = {
      accessKeyId: new SecureString((envObj as any)['AWS_ACCESS_KEY_ID'] ?? ''),
      secretAccessKey: new SecureString((envObj as any)['AWS_SECRET_ACCESS_KEY'] ?? ''),
      region: (envObj as any)['AWS_REGION'] ?? 'us-west-2',
    };

    if (process.env['NODE_ENV'] !== 'test' &&
        process.env['NODE_ENV'] !== 'development' &&
        emailServiceRegistry.isServiceType(EmailService) && // only enforce if real EmailService is used
       this._aws.accessKeyId.length === 0) {
      throw new Error(
        getSuiteCoreTranslation(SuiteCoreStringKey.Admin_EnvNotSetTemplate, {
          variable: 'AWS_ACCESS_KEY_ID',
        }),
      );
    }
    if (process.env['NODE_ENV'] !== 'test' && 
        process.env['NODE_ENV'] !== 'development' &&
        emailServiceRegistry.isServiceType(EmailService) && // only enforce if real EmailService is used
      this._aws.secretAccessKey.length === 0) {
      throw new Error(
        getSuiteCoreTranslation(SuiteCoreStringKey.Admin_EnvNotSetTemplate, {
          variable: 'AWS_SECRET_ACCESS_KEY',
        }),
      );
    }
    if (!this._aws.region) {
      throw new Error(
        getSuiteCoreTranslation(SuiteCoreStringKey.Admin_EnvNotSetTemplate, { variable: 'AWS_REGION' }),
      );
    }
  }

  public get aws(): IEnvironmentAws {
    return this._aws;
  }
}
