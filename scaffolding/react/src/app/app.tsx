import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { 
  PrivateRoute, 
  UnAuthRoute, 
  TopMenu,
  DashboardPage,
  LogoutPageWrapper,
  TranslatedTitle,
  AppThemeProvider,
  I18nProvider as TranslationProvider,
  ApiAccess,
  AuthProvider,
  BackupCodeLoginWrapper,
  BackupCodesWrapper,
  ChangePasswordFormWrapper,
  LoginFormWrapper,
  RegisterFormWrapper,
  VerifyEmailPageWrapper
} from '@digitaldefiance/express-suite-react-components';
import { Constants } from '@digitaldefiance/suite-core-lib';
import { ECIES } from '@digitaldefiance/ecies-lib';
import { theme } from '@NAMESPACE@/react-lib';
import { StringName, i18nEngine } from '@NAMESPACE@/lib';
import { environment } from '../environments/environment';
import SplashPage from './pages/SplashPage';
import '../styles.scss';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && (window as any).__RUNTIME_CONFIG__) {
    return (window as any).__RUNTIME_CONFIG__.apiUrl?.replace(/\/api$/, '') || '';
  }
  return environment.apiUrl.replace(/\/api$/, '');
};

const API_BASE_URL = getApiBaseUrl();



const App: FC = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TranslationProvider i18nEngine={i18nEngine}>
        <TranslatedTitle<StringName> componentId="StringName" stringKey={StringName.SiteTitle} />
        <ThemeProvider theme={theme}>
          <AppThemeProvider>
            <CssBaseline />
            <AuthProvider baseUrl={API_BASE_URL} constants={Constants} eciesConfig={ECIES}>
              <InnerApp />
            </AuthProvider>
          </AppThemeProvider>
        </ThemeProvider>
      </TranslationProvider>
    </LocalizationProvider>
  );
};

const InnerApp: FC = () => {
  return (
    <Box className="app-container" sx={{ paddingTop: '64px' }}>
      <TopMenu Logo="/assets/albatross.svg" />
      <Routes>
                <Route path="/" element={<SplashPage />} />
                <Route
                  path="/api-access"
                  element={
                    <PrivateRoute>
                      <ApiAccess />
                    </PrivateRoute>
                  }
                />
                <Route path="/backup-code" element={<BackupCodeLoginWrapper />} />
                <Route
                  path="/backup-codes"
                  element={
                    <PrivateRoute>
                      <BackupCodesWrapper baseUrl={API_BASE_URL} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <UnAuthRoute>
                      <LoginFormWrapper />
                    </UnAuthRoute>
                  }
                />
                <Route
                  path="/logout"
                  element={
                    <PrivateRoute>
                      <LogoutPageWrapper />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <UnAuthRoute>
                      <RegisterFormWrapper />
                    </UnAuthRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/change-password"
                  element={
                    <PrivateRoute>
                      <ChangePasswordFormWrapper />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/verify-email"
                  element={
                    <UnAuthRoute>
                      <VerifyEmailPageWrapper baseUrl={API_BASE_URL} />
                    </UnAuthRoute>
                  }
                />
      </Routes>
    </Box>
  );
};

export default App;
