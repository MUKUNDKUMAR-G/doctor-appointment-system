import { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});

  // Set loading state for a specific key
  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading,
    }));
  }, []);

  // Get loading state for a specific key
  const isLoading = useCallback((key) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  // Check if any loading state is active
  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  // Clear all loading states
  const clearLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  // Wrapper function to handle async operations with loading states
  const withLoading = useCallback(async (key, asyncOperation) => {
    try {
      setLoading(key, true);
      const result = await asyncOperation();
      return result;
    } finally {
      setLoading(key, false);
    }
  }, [setLoading]);

  const value = {
    setLoading,
    isLoading,
    isAnyLoading,
    clearLoading,
    withLoading,
    loadingStates,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;