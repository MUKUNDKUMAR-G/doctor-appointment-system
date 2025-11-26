import { useState, useCallback, useRef, useEffect } from 'react';
import { useError } from '../contexts/ErrorContext';
import { useLoading } from '../contexts/LoadingContext';
import { createCancelToken, isCancel } from '../services/api';

export const useApiCall = (options = {}) => {
  const {
    onSuccess,
    onError,
    showErrorMessage = true,
    showSuccessMessage = false,
    loadingKey,
    retries = 0,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addError, addSuccess } = useError();
  const { setLoading: setGlobalLoading } = useLoading();
  const cancelTokenRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  const execute = useCallback(async (apiCall, optimisticUpdate = null, rollbackUpdate = null) => {
    // Cancel previous request if it exists
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('New request initiated');
    }

    // Create new cancel token
    cancelTokenRef.current = createCancelToken();

    try {
      setIsLoading(true);
      setError(null);

      if (loadingKey) {
        setGlobalLoading(loadingKey, true);
      }

      // Apply optimistic update if provided
      if (optimisticUpdate) {
        optimisticUpdate();
      }

      let result;
      let lastError;

      // Retry logic
      for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
          result = await apiCall(cancelTokenRef.current.token);
          break; // Success, exit retry loop
        } catch (err) {
          lastError = err;

          // Don't retry if request was cancelled
          if (isCancel(err)) {
            return;
          }

          // Don't retry on client errors (4xx) except 408, 429
          if (err.response?.status >= 400 && err.response?.status < 500) {
            if (err.response.status !== 408 && err.response.status !== 429) {
              throw err;
            }
          }

          // Don't retry on the last attempt
          if (attempt === retries + 1) {
            throw err;
          }

          // Wait before retrying with exponential backoff
          const waitTime = retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }

      setData(result?.data || result);

      if (onSuccess) {
        onSuccess(result?.data || result);
      }

      if (showSuccessMessage && result?.message) {
        addSuccess(result.message);
      }

      return result?.data || result;
    } catch (err) {
      // Don't handle cancelled requests
      if (isCancel(err)) {
        return;
      }

      // Rollback optimistic update on error
      if (rollbackUpdate) {
        rollbackUpdate();
      }

      setError(err);

      if (showErrorMessage) {
        addError(err);
      }

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setIsLoading(false);
      if (loadingKey) {
        setGlobalLoading(loadingKey, false);
      }
      cancelTokenRef.current = null;
    }
  }, [
    onSuccess,
    onError,
    showErrorMessage,
    showSuccessMessage,
    loadingKey,
    retries,
    retryDelay,
    addError,
    addSuccess,
    setGlobalLoading,
  ]);

  const cancel = useCallback(() => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Request cancelled by user');
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    cancel,
    reset,
  };
};

export default useApiCall;