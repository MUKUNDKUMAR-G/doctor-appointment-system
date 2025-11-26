import axios from 'axios';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../utils/constants';
import { endpoints } from '../utils/config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 15000, // Increased timeout for better UX
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global error handler reference (will be set by the app)
let globalErrorHandler = null;
let globalLoadingHandler = null;

// Set global handlers
export const setGlobalHandlers = (errorHandler, loadingHandler) => {
  globalErrorHandler = errorHandler;
  globalLoadingHandler = loadingHandler;
};

// Request interceptor to add auth token and handle loading
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.metadata = {
      startTime: Date.now(),
      requestId: Math.random().toString(36).substring(2, 11)
    };

    // Set loading state if handler is available
    if (globalLoadingHandler && !config.skipLoading) {
      globalLoadingHandler.setLoading(config.metadata.requestId, true);
    }

    return config;
  },
  (error) => {
    // Handle request setup errors
    if (globalErrorHandler) {
      globalErrorHandler.addError(error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    // Clear loading state for successful requests
    if (globalLoadingHandler && response.config.metadata?.requestId) {
      globalLoadingHandler.setLoading(response.config.metadata.requestId, false);
    }

    // Log response time in development
    if (import.meta.env.DEV && response.config.metadata?.startTime) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`API Request completed in ${duration}ms: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Clear loading state for failed requests
    if (globalLoadingHandler && originalRequest.metadata?.requestId) {
      globalLoadingHandler.setLoading(originalRequest.metadata.requestId, false);
    }

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          // Create a new axios instance to avoid interceptor loops
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}${endpoints.auth.refresh}`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              },
              skipLoading: true, // Don't show loading for refresh requests
            }
          );

          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

          // Update tokens in localStorage
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          if (newRefreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);

        // Show error message
        if (globalErrorHandler) {
          globalErrorHandler.addError('Your session has expired. Please log in again.');
        }

        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Enhanced error handling
    const enhancedError = enhanceError(error);

    // Show error message globally if not explicitly disabled
    if (globalErrorHandler && !originalRequest.skipErrorHandling) {
      globalErrorHandler.addError(enhancedError);
    }

    return Promise.reject(enhancedError);
  }
);

// Enhanced error processing
const enhanceError = (error) => {
  const enhanced = { ...error };

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    enhanced.statusCode = status;
    enhanced.serverMessage = data?.message || data?.error;

    // Set user-friendly message based on status code
    switch (status) {
      case 400:
        enhanced.message = data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
        break;
      case 401:
        enhanced.message = ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case 403:
        enhanced.message = 'Access denied. You do not have permission to perform this action.';
        break;
      case 404:
        enhanced.message = 'The requested resource was not found.';
        break;
      case 409:
        enhanced.message = data?.message || ERROR_MESSAGES.APPOINTMENT_CONFLICT;
        break;
      case 422:
        enhanced.message = data?.message || 'Invalid data provided.';
        break;
      case 429:
        enhanced.message = 'Too many requests. Please try again later.';
        break;
      case 500:
        enhanced.message = 'Server error. Please try again later.';
        break;
      case 503:
        enhanced.message = 'Service temporarily unavailable. Please try again later.';
        break;
      default:
        enhanced.message = data?.message || ERROR_MESSAGES.GENERIC_ERROR;
    }
  } else if (error.request) {
    // Network error
    enhanced.message = ERROR_MESSAGES.NETWORK_ERROR;
    enhanced.isNetworkError = true;
  } else {
    // Request setup error
    enhanced.message = error.message || ERROR_MESSAGES.GENERIC_ERROR;
  }

  return enhanced;
};

// Utility function for optimistic updates
export const withOptimisticUpdate = async (
  optimisticUpdate,
  apiCall,
  rollbackUpdate
) => {
  try {
    // Apply optimistic update immediately
    optimisticUpdate();

    // Make the API call
    const result = await apiCall();

    return result;
  } catch (error) {
    // Rollback the optimistic update on error
    if (rollbackUpdate) {
      rollbackUpdate();
    }
    throw error;
  }
};

// Utility function for retry logic
export const withRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except 408, 429
      if (error.response?.status >= 400 && error.response?.status < 500) {
        if (error.response.status !== 408 && error.response.status !== 429) {
          throw error;
        }
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying with exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
};

// Utility function for request cancellation
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

// Check if error is a cancellation
export const isCancel = (error) => {
  return axios.isCancel(error);
};

export default api;