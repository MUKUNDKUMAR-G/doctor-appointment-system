import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { STORAGE_KEYS } from '../utils/constants';

const useTokenExpiration = () => {
  const { logout, isAuthenticated } = useAuth();

  const checkTokenExpiration = useCallback(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      logout();
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired
      if (payload.exp < currentTime) {
        console.log('Token expired, logging out...');
        logout();
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
      logout();
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check token expiration immediately
    checkTokenExpiration();

    // Set up interval to check token expiration every minute
    const intervalId = setInterval(checkTokenExpiration, 60000);

    // Set up event listeners for tab focus/visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkTokenExpiration();
      }
    };

    const handleFocus = () => {
      checkTokenExpiration();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, checkTokenExpiration]);

  return { checkTokenExpiration };
};

export default useTokenExpiration;