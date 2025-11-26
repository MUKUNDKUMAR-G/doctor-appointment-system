import { useState, useCallback } from 'react';

export const useFormErrors = () => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const parseError = useCallback((error) => {
    if (!error) return;

    // Check if it's an axios error with response data
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // If it has field-specific errors (like {password: "Password is too short"})
      if (typeof errorData === 'object' && !errorData.message && !errorData.error) {
        const fieldErrs = {};
        let hasFieldErrors = false;
        
        Object.entries(errorData).forEach(([field, message]) => {
          if (typeof message === 'string') {
            fieldErrs[field] = message;
            hasFieldErrors = true;
          }
        });
        
        if (hasFieldErrors) {
          setFieldErrors(fieldErrs);
          setGeneralError(null);
          return;
        }
      }
      
      // Handle general error messages
      const message = errorData.message || errorData.error;
      if (message) {
        setGeneralError(message);
        setFieldErrors({});
        return;
      }
    }
    
    // Check if the error message contains field-specific validation info
    if (error.message && error.message.includes('Validation failed:')) {
      // Try to parse field-specific errors from the message
      const validationMessage = error.message.replace('Validation failed: ', '');
      const fieldMatches = validationMessage.match(/(\w+): ([^,]+)/g);
      
      if (fieldMatches) {
        const fieldErrs = {};
        fieldMatches.forEach(match => {
          const [, field, message] = match.match(/(\w+): (.+)/);
          fieldErrs[field] = message;
        });
        
        setFieldErrors(fieldErrs);
        setGeneralError(null);
        return;
      }
    }
    
    // Fallback to error message
    const message = error.message || 'An error occurred';
    setGeneralError(message);
    setFieldErrors({});
  }, []);

  const clearErrors = useCallback(() => {
    setFieldErrors({});
    setGeneralError(null);
  }, []);

  const clearFieldError = useCallback((field) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setFieldError = useCallback((field, message) => {
    setFieldErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  return {
    fieldErrors,
    generalError,
    parseError,
    clearErrors,
    clearFieldError,
    setFieldError,
    hasErrors: Object.keys(fieldErrors).length > 0 || !!generalError
  };
};

export default useFormErrors;