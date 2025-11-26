import { createContext, useContext, useState, useCallback } from 'react';
import { ERROR_MESSAGES } from '../utils/constants';

const ErrorContext = createContext();

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);

  // Add a new error
  const addError = useCallback((error, options = {}) => {
    const errorId = Date.now() + Math.random();
    const errorObj = {
      id: errorId,
      message: getErrorMessage(error),
      type: options.type || 'error',
      duration: options.duration || 5000,
      persistent: options.persistent || false,
      timestamp: new Date(),
    };

    setErrors(prev => [...prev, errorObj]);

    // Auto-remove non-persistent errors
    if (!errorObj.persistent) {
      setTimeout(() => {
        removeError(errorId);
      }, errorObj.duration);
    }

    return errorId;
  }, []);

  // Remove an error by ID
  const removeError = useCallback((errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Add success message
  const addSuccess = useCallback((message, options = {}) => {
    return addError(message, { ...options, type: 'success' });
  }, [addError]);

  // Add warning message
  const addWarning = useCallback((message, options = {}) => {
    return addError(message, { ...options, type: 'warning' });
  }, [addError]);

  // Add info message
  const addInfo = useCallback((message, options = {}) => {
    return addError(message, { ...options, type: 'info' });
  }, [addError]);

  const value = {
    errors,
    addError,
    addSuccess,
    addWarning,
    addInfo,
    removeError,
    clearErrors,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

// Helper function to extract meaningful error messages
const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return ERROR_MESSAGES.APPOINTMENT_CONFLICT;
      case 500:
        return 'Server error. Please try again later.';
      default:
        return ERROR_MESSAGES.GENERIC_ERROR;
    }
  }

  return ERROR_MESSAGES.GENERIC_ERROR;
};

export default ErrorContext;