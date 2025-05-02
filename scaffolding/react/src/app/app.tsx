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
  LoginForm,
  RegisterForm,
  LogoutPage,
  TranslatedTitle,
  AppThemeProvider,
  I18nProvider as TranslationProvider,
  ApiAccess,
  BackupCodeLoginForm,
  BackupCodesForm,
  ChangePasswordForm,
  VerifyEmailPage
} from '@digitaldefiance/express-suite-react-components';
import { theme } from '@NAMESPACE@/react-lib';
import SplashPage from './pages/SplashPage';
import '../styles.scss';

const App: FC = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TranslationProvider>
        <TranslatedTitle />
        <ThemeProvider theme={theme}>
          <AppThemeProvider>
            <CssBaseline />
            <Box className="app-container" sx={{ paddingTop: '64px' }}>
              <TopMenu />
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
                <Route path="/backup-code" element={<BackupCodeLoginForm />} />
                <Route
                  path="/backup-codes"
                  element={
                    <PrivateRoute>
                      <BackupCodesForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <UnAuthRoute>
                      <LoginForm />
                    </UnAuthRoute>
                  }
                />
                <Route
                  path="/logout"
                  element={
                    <PrivateRoute>
                      <LogoutPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <UnAuthRoute>
                      <RegisterForm />
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
                      <ChangePasswordForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/verify-email"
                  element={
                    <UnAuthRoute>
                      <VerifyEmailPage />
                    </UnAuthRoute>
                  }
                />
              </Routes>
            </Box>
          </AppThemeProvider>
        </ThemeProvider>
      </TranslationProvider>
    </LocalizationProvider>
  );
};

export default App;
