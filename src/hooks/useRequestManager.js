import { useRef, useCallback, useEffect } from 'react';

// Request priorities
export const REQUEST_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high'
};

// Default request options
const DEFAULT_OPTIONS = {
  priority: REQUEST_PRIORITIES.NORMAL,
  timeout: 15000,
  retries: 3,
  dedupe: true
};

export const useRequestManager = () => {
  // Store active requests by key
  const activeRequests = useRef(new Map());
  
  // Store pending requests for deduplication
  const pendingRequests = useRef(new Map());
  
  // Request counter for unique IDs
  const requestCounter = useRef(0);

  /**
   * Generate a unique request fingerprint for deduplication
   */
  const generateFingerprint = useCallback((key, options = {}) => {
    const { method = 'GET', params = {}, body = null } = options;
    const paramsStr = JSON.stringify(params);
    const bodyStr = body ? JSON.stringify(body) : '';
    return `${method}:${key}:${paramsStr}:${bodyStr}`;
  }, []);

  /**
   * Create a new request state object
   */
  const createRequestState = useCallback((key, options) => {
    const id = `req_${++requestCounter.current}`;
    const abortController = new AbortController();
    
    return {
      id,
      key,
      status: 'pending',
      priority: options.priority || REQUEST_PRIORITIES.NORMAL,
      startTime: Date.now(),
      abortController,
      options
    };
  }, []);

  /**
   * Cancel all pending requests for a specific key
   */
  const cancelRequests = useCallback((key) => {
    const requestsToCancel = [];
    
    // Find all requests with matching key
    activeRequests.current.forEach((request, requestId) => {
      if (!key || request.key === key) {
        requestsToCancel.push(requestId);
      }
    });

    // Cancel each request
    requestsToCancel.forEach(requestId => {
      const request = activeRequests.current.get(requestId);
      if (request && request.status === 'pending') {
        request.abortController.abort();
        request.status = 'cancelled';
        activeRequests.current.delete(requestId);
      }
    });

    // Clear pending requests for the key
    if (key) {
      const keysToDelete = [];
      pendingRequests.current.forEach((_, fingerprint) => {
        if (fingerprint.includes(key)) {
          keysToDelete.push(fingerprint);
        }
      });
      keysToDelete.forEach(k => pendingRequests.current.delete(k));
    } else {
      // Cancel all if no key specified
      pendingRequests.current.clear();
    }

    return requestsToCancel.length;
  }, []);

  /**
   * Execute a request with automatic cancellation and deduplication
   */
  const executeRequest = useCallback(async (key, requestFn, options = {}) => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const fingerprint = generateFingerprint(key, mergedOptions);

    // Check for existing pending request (deduplication)
    if (mergedOptions.dedupe && pendingRequests.current.has(fingerprint)) {
      // Return the existing promise
      return pendingRequests.current.get(fingerprint);
    }

    // Cancel existing requests for this key if priority is high
    if (mergedOptions.priority === REQUEST_PRIORITIES.HIGH) {
      cancelRequests(key);
    }

    // Create new request state
    const requestState = createRequestState(key, mergedOptions);
    activeRequests.current.set(requestState.id, requestState);

    // Create the request promise
    const requestPromise = new Promise(async (resolve, reject) => {
      try {
        // Set up timeout
        const timeoutId = setTimeout(() => {
          if (requestState.status === 'pending') {
            requestState.abortController.abort();
            reject(new Error(`Request timeout after ${mergedOptions.timeout}ms`));
          }
        }, mergedOptions.timeout);

        // Execute the request function with abort signal
        const result = await requestFn({
          signal: requestState.abortController.signal,
          ...mergedOptions
        });

        // Clear timeout and update status
        clearTimeout(timeoutId);
        requestState.status = 'completed';
        
        resolve(result);
      } catch (error) {
        requestState.status = 'error';
        
        // Don't reject if request was cancelled
        if (error.name === 'AbortError' || requestState.abortController.signal.aborted) {
          requestState.status = 'cancelled';
          reject(new Error('Request cancelled'));
        } else {
          reject(error);
        }
      } finally {
        // Clean up
        activeRequests.current.delete(requestState.id);
        pendingRequests.current.delete(fingerprint);
      }
    });

    // Store the promise for deduplication
    if (mergedOptions.dedupe) {
      pendingRequests.current.set(fingerprint, requestPromise);
    }

    return requestPromise;
  }, [generateFingerprint, createRequestState, cancelRequests]);

  /**
   * Check if there are pending requests
   */
  const hasPendingRequests = useCallback((key) => {
    if (!key) {
      return activeRequests.current.size > 0;
    }

    for (const request of activeRequests.current.values()) {
      if (request.key === key && request.status === 'pending') {
        return true;
      }
    }
    return false;
  }, []);

  /**
   * Get all active requests (for debugging)
   */
  const getActiveRequests = useCallback(() => {
    return Array.from(activeRequests.current.values());
  }, []);

  /**
   * Get request statistics
   */
  const getRequestStats = useCallback(() => {
    const requests = Array.from(activeRequests.current.values());
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      completed: requests.filter(r => r.status === 'completed').length,
      cancelled: requests.filter(r => r.status === 'cancelled').length,
      error: requests.filter(r => r.status === 'error').length,
      byPriority: {
        high: requests.filter(r => r.priority === REQUEST_PRIORITIES.HIGH).length,
        normal: requests.filter(r => r.priority === REQUEST_PRIORITIES.NORMAL).length,
        low: requests.filter(r => r.priority === REQUEST_PRIORITIES.LOW).length,
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel all pending requests when component unmounts
      cancelRequests();
    };
  }, [cancelRequests]);

  return {
    cancelRequests,
    executeRequest,
    hasPendingRequests,
    getActiveRequests,
    getRequestStats,
    REQUEST_PRIORITIES
  };
};

export default useRequestManager;