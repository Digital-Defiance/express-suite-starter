import { IAppConfig } from '@digitaldefiance/express-suite-react-components';
import { IEnvironment } from '../interfaces/environment';

const appConfig: IAppConfig | undefined =
  'APP_CONFIG' in window
    ? ((window as any).APP_CONFIG as IAppConfig)
    : undefined;

const server = appConfig?.server;

export const environment: IEnvironment = {
  production: false,
  siteUrl: server ?? 'http://localhost:3000',
  apiUrl: server !== undefined ? `${server}/api` : 'http://localhost:3000/api',
  emailDomain: 'localhost.localdomain',
};
