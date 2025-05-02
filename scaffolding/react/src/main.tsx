import { GlobalActiveContext, IActiveContext, CoreLanguageCode } from '@digitaldefiance/i18n-lib';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

const context = GlobalActiveContext.getInstance<CoreLanguageCode, IActiveContext<CoreLanguageCode>>();
context.languageContextSpace = 'user';

root.render(
  <StrictMode>
    <BrowserRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    >
      <App />
    </BrowserRouter>
  </StrictMode>,
);
