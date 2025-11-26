import api from '../services/api';

/**
 * Helper functions to integrate useRequestManager with existing API service
 */

/**
 * Create a request function that works with the request manager
 * @param {Function} apiCall - The API call function
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @returns {Function} - Request function compatible with request manager
 */
export const createManagedRequest = (apiCall, method = 'GET') => {
  return async (options = {}) => {
    const { signal, ...otherOptions } = options;
    
    // Create axios config with abort signal
    const config = {
      ...otherOptions,
      signal, // AbortController signal for cancellation
    };

    // Execute the API call with the abort signal
    return await apiCall(config);
  };
};

/**
 * Create a managed API request for common HTTP methods
 */
export const createManagedApiRequest = (url, method = 'GET', data = null) => {
  return createManagedRequest(async (config) => {
    const requestConfig = {
      method,
      url,
      ...config,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestConfig.data = data;
    }

    const response = await api(requestConfig);
    return response.data;
  }, method);
};

/**
 * Wrapper for GET requests
 */
export const createGetRequest = (url, params = {}) => {
  return createManagedRequest(async (config) => {
    const response = await api.get(url, {
      params,
      ...config,
    });
    return response.data;
  }, 'GET');
};

/**
 * Wrapper for POST requests
 */
export const createPostRequest = (url, data = {}) => {
  return createManagedRequest(async (config) => {
    const response = await api.post(url, data, config);
    return response.data;
  }, 'POST');
};

/**
 * Wrapper for PUT requests
 */
export const createPutRequest = (url, data = {}) => {
  return createManagedRequest(async (config) => {
    const response = await api.put(url, data, config);
    return response.data;
  }, 'PUT');
};

/**
 * Wrapper for DELETE requests
 */
export const createDeleteRequest = (url) => {
  return createManagedRequest(async (config) => {
    const response = await api.delete(url, config);
    return response.data;
  }, 'DELETE');
};

/**
 * Convert existing API service methods to work with request manager
 */
export const wrapApiService = (apiService) => {
  const wrappedService = {};
  
  Object.keys(apiService).forEach(methodName => {
    const originalMethod = apiService[methodName];
    
    wrappedService[methodName] = createManagedRequest(async (config) => {
      // Call the original method with the config (including signal)
      return await originalMethod(config);
    });
  });
  
  return wrappedService;
};

/**
 * Create request key for consistent naming
 */
export const createRequestKey = (service, method, ...params) => {
  const paramStr = params.length > 0 ? `_${params.join('_')}` : '';
  return `${service}_${method}${paramStr}`;
};

/**
 * Common request options presets
 */
export const REQUEST_PRESETS = {
  // High priority for user actions
  USER_ACTION: {
    priority: 'high',
    timeout: 10000,
    retries: 2,
    dedupe: false
  },
  
  // Normal priority for data fetching
  DATA_FETCH: {
    priority: 'normal',
    timeout: 15000,
    retries: 3,
    dedupe: true
  },
  
  // Low priority for background operations
  BACKGROUND: {
    priority: 'low',
    timeout: 30000,
    retries: 1,
    dedupe: true
  },
  
  // Critical operations that shouldn't be cancelled
  CRITICAL: {
    priority: 'high',
    timeout: 20000,
    retries: 5,
    dedupe: false
  }
};

export default {
  createManagedRequest,
  createManagedApiRequest,
  createGetRequest,
  createPostRequest,
  createPutRequest,
  createDeleteRequest,
  wrapApiService,
  createRequestKey,
  REQUEST_PRESETS
};