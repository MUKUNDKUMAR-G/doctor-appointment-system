import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token is expired
  const isTokenExpired = useCallback((token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }, []);

  // Refresh token automatically
  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(refreshTokenValue);
      
      // Update tokens in localStorage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }

      return response.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  }, []);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        
        if (token && userData) {
          // Check if token is expired
          if (isTokenExpired(token)) {
            // Try to refresh token
            try {
              await refreshToken();
              const parsedUser = JSON.parse(userData);
              setUser(parsedUser);
              setIsAuthenticated(true);
            } catch (refreshError) {
              // Refresh failed, user needs to login again
              logout();
            }
          } else {
            // Token is still valid
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isTokenExpired, refreshToken]);

  // Set up automatic token refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      
      // Refresh token 5 minutes before expiry
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);

      const timeoutId = setTimeout(async () => {
        try {
          await refreshToken();
        } catch (error) {
          console.error('Automatic token refresh failed:', error);
        }
      }, refreshTime);

      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error('Error setting up token refresh:', error);
    }
  }, [isAuthenticated, refreshToken]);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      
      // Store tokens and user data
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      
      // Extract user data from response (same structure as registration)
      const userInfo = {
        id: response.userId,  // For compatibility with existing components
        userId: response.userId,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        role: response.role
      };
      
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userInfo));
      setUser(userInfo);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.register(userData);
      
      // Auto-login after successful registration
      if (response.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        
        // Extract user data from response
        const userInfo = {
          id: response.userId,  // For compatibility with existing components
          userId: response.userId,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.role
        };
        
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userInfo));
        setUser(userInfo);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error) {
      // Don't set error here - let the component handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to invalidate tokens on server
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of server response
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  }, []);

  const updateUser = (updatedUserData) => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUserData));
    setUser(updatedUserData);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;