import { useCallback } from 'react';
import useCache from './useCache';
import useRequestManager from './useRequestManager';
import { createCacheKey, TTL_PRESETS } from '../utils/cacheHelpers';
import { createRequestKey, REQUEST_PRESETS } from '../utils/requestManagerHelpers';

/**
 * Integration hook that combines useCache and useRequestManager
 * 
 * This demonstrates how the cache system works together with request management
 * to provide optimal performance and user experience.
 */

export const useCachedRequestManager = (config = {}) => {
  const cache = useCache(config);
  const requestManager = useRequestManager();

  /**
   * Execute a request with caching and request management
   */
  const executeWithCache = useCallback(async (
    cacheKey,
    requestKey,
    requestFn,
    options = {}
  ) => {
    const {
      ttl = TTL_PRESETS.MEDIUM,
      useStaleWhileRevalidate = true,
      requestOptions = REQUEST_PRESETS.DATA_FETCH,
      forceRefresh = false
    } = options;

    // If force refresh, invalidate cache first
    if (forceRefresh) {
      cache.invalidate(cacheKey);
    }

    if (useStaleWhileRevalidate) {
      return cache.getStaleWhileRevalidate(
        cacheKey,
        () => requestManager.executeRequest(requestKey, requestFn, requestOptions),
        { ttl }
      );
    } else {
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached && !cached.isStale) {
        return cached.data;
      }

      // Execute request and cache result
      const result = await requestManager.executeRequest(requestKey, requestFn, requestOptions);
      cache.set(cacheKey, result, ttl);
      return result;
    }
  }, [cache, requestManager]);

  /**
   * Cancel requests and optionally clear related cache
   */
  const cancelAndClear = useCallback((requestKey, cachePattern = null) => {
    const cancelledCount = requestManager.cancelRequests(requestKey);
    
    if (cachePattern) {
      const invalidatedCount = cache.invalidate(cachePattern);
      return { cancelledCount, invalidatedCount };
    }
    
    return { cancelledCount };
  }, [requestManager, cache]);

  /**
   * Get combined statistics
   */
  const getStats = useCallback(() => {
    return {
      cache: cache.getStats(),
      requests: requestManager.getRequestStats()
    };
  }, [cache, requestManager]);

  /**
   * Prefetch data with request management
   */
  const prefetch = useCallback(async (cacheKey, requestKey, requestFn, ttl = TTL_PRESETS.MEDIUM) => {
    // Only prefetch if not already cached or pending
    if (!cache.has(cacheKey) && !requestManager.hasPendingRequests(requestKey)) {
      try {
        const result = await requestManager.executeRequest(
          requestKey,
          requestFn,
          { ...REQUEST_PRESETS.BACKGROUND, priority: 'low' }
        );
        cache.set(cacheKey, result, ttl);
        return result;
      } catch (error) {
        console.warn(`Prefetch failed for ${cacheKey}:`, error);
        return null;
      }
    }
    return null;
  }, [cache, requestManager]);

  return {
    // Combined operations
    executeWithCache,
    cancelAndClear,
    prefetch,
    
    // Statistics
    getStats,
    
    // Direct access to underlying systems
    cache,
    requestManager,
    
    // Utility methods
    clearCache: cache.clear,
    cancelAllRequests: () => requestManager.cancelRequests(),
    invalidateCache: cache.invalidate,
    hasPendingRequests: requestManager.hasPendingRequests
  };
};

/**
 * Specialized hook for appointment operations with full optimization
 */
export const useOptimizedAppointmentOperations = () => {
  const { executeWithCache, prefetch, cancelAndClear, cache } = useCachedRequestManager({
    maxSize: 100,
    defaultTTL: TTL_PRESETS.MEDIUM
  });

  /**
   * Optimized appointment fetching
   */
  const fetchAppointments = useCallback(async (userId, options = {}) => {
    const cacheKey = createCacheKey('appointments', 'list', userId);
    const requestKey = createRequestKey('appointments', 'fetch', userId);
    
    return executeWithCache(
      cacheKey,
      requestKey,
      async ({ signal }) => {
        const response = await fetch(`/api/appointments?userId=${userId}`, {
          signal,
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
      },
      {
        ttl: TTL_PRESETS.MEDIUM,
        useStaleWhileRevalidate: true,
        requestOptions: REQUEST_PRESETS.DATA_FETCH,
        ...options
      }
    );
  }, [executeWithCache]);

  /**
   * Optimized single appointment fetch
   */
  const fetchAppointment = useCallback(async (appointmentId, options = {}) => {
    const cacheKey = createCacheKey('appointment', 'single', appointmentId);
    const requestKey = createRequestKey('appointment', 'fetch', appointmentId);
    
    return executeWithCache(
      cacheKey,
      requestKey,
      async ({ signal }) => {
        const response = await fetch(`/api/appointments/${appointmentId}`, {
          signal,
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
      },
      {
        ttl: TTL_PRESETS.LONG,
        useStaleWhileRevalidate: true,
        requestOptions: REQUEST_PRESETS.DATA_FETCH,
        ...options
      }
    );
  }, [executeWithCache]);

  /**
   * Prefetch appointments for better UX
   */
  const prefetchAppointments = useCallback(async (userId) => {
    const cacheKey = createCacheKey('appointments', 'list', userId);
    const requestKey = createRequestKey('appointments', 'prefetch', userId);
    
    return prefetch(
      cacheKey,
      requestKey,
      async ({ signal }) => {
        const response = await fetch(`/api/appointments?userId=${userId}`, {
          signal,
          headers: { 'Content-Type': 'application/json' }
        });
        return response.json();
      },
      TTL_PRESETS.MEDIUM
    );
  }, [prefetch]);

  /**
   * Cancel appointment operations and clear cache
   */
  const cancelAppointmentOperations = useCallback((userId = null) => {
    const requestPattern = userId ? `appointments_${userId}` : 'appointments';
    const cachePattern = userId ? new RegExp(`appointments.*${userId}`) : /appointments/;
    
    return cancelAndClear(requestPattern, cachePattern);
  }, [cancelAndClear]);

  /**
   * Invalidate appointment cache after mutations
   */
  const invalidateAppointmentCache = useCallback((userId = null) => {
    if (userId) {
      cache.invalidate(new RegExp(`appointments.*${userId}`));
    } else {
      cache.invalidate(/appointments/);
    }
  }, [cache]);

  return {
    fetchAppointments,
    fetchAppointment,
    prefetchAppointments,
    cancelAppointmentOperations,
    invalidateAppointmentCache,
    
    // Direct access for advanced usage
    cache,
    executeWithCache
  };
};

export default useCachedRequestManager;