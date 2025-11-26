import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { RealTimeSyncProvider } from './contexts/RealTimeSyncContext';
import { AdminRealTimeProvider } from './contexts/AdminRealTimeContext';
import { MotionProvider } from './contexts/MotionContext';
import AppRoutes from './routes/AppRoutes';
import GlobalNotifications from './components/GlobalNotifications';
import GlobalLoading from './components/GlobalLoading';
import SkipNavigation from './components/common/SkipNavigation';
import useTokenExpiration from './hooks/useTokenExpiration';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { setGlobalHandlers } from './services/api';
import { useError } from './contexts/ErrorContext';
import { useLoading } from './contexts/LoadingContext';
import { useEffect } from 'react';
import { theme } from './theme';

// Component to handle token expiration checking and global handlers setup
const TokenExpirationHandler = ({ children }) => {
  useTokenExpiration();
  useKeyboardNavigation();
  return children;
};

// Component to set up global API handlers
const GlobalHandlersSetup = ({ children }) => {
  const errorHandler = useError();
  const loadingHandler = useLoading();

  useEffect(() => {
    setGlobalHandlers(errorHandler, loadingHandler);
  }, [errorHandler, loadingHandler]);

  return children;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#fff',
            color: '#374151',
            borderRadius: '12px',
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <BrowserRouter>
        <ErrorProvider>
          <LoadingProvider>
            <MotionProvider>
              <AuthProvider>
                <NotificationProvider>
                  <RealTimeSyncProvider>
                    <AdminRealTimeProvider>
                      <GlobalHandlersSetup>
                        <TokenExpirationHandler>
                          <SkipNavigation />
                          <AppRoutes />
                          <GlobalNotifications />
                          <GlobalLoading />
                        </TokenExpirationHandler>
                      </GlobalHandlersSetup>
                    </AdminRealTimeProvider>
                  </RealTimeSyncProvider>
                </NotificationProvider>
              </AuthProvider>
            </MotionProvider>
          </LoadingProvider>
        </ErrorProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;