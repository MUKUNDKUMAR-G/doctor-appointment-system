import { useCallback } from 'react';
import useCache from './useCache';
import { createApiCacheKey, TTL_PRESETS, INVALIDATION_PATTERNS } from '../utils/cacheHelpers';

/**
 * Example usage of useCache hook with appointment data
 * 
 * This demonstrates how to integrate the cache system with existing API calls
 * and provides patterns for common caching scenarios.
 */

export const useCachedAppointments = () => {
  // Initialize cache with custom configuration
  const cache = useCache({
    maxSize: 50,
    defaultTTL: TTL_PRESETS.MEDIUM, // 5 minutes
    staleTime: TTL_PRESETS.SHORT,   // 2 minutes
    enableGC: true
  });

  /**
   * Cached appointment fetching with stale-while-revalidate
   */
  const getAppointments = useCallback(async (userId, filters = {}) => {
    const cacheKey = createApiCacheKey('appointments', { userId, ...filters });
    
    return cache.getStaleWhileRevalidate(
      cacheKey,
      async () => {
        // This would be your actual API call
        const response = await fetch(`/api/appointments?userId=${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        return response.json();
      },
      { ttl: TTL_PRESETS.MEDIUM }
    );
  }, [cache]);

  /**
   * Cached single appointment fetch
   */
  const getAppointment = useCallback(async (appointmentId) => {
    const cacheKey = createApiCacheKey('appointment', { id: appointmentId });
    
    return cache.getStaleWhileRevalidate(
      cacheKey,
      async () => {
        const response = await fetch(`/api/appointments/${appointmentId}`);
        return response.json();
      },
      { ttl: TTL_PRESETS.LONG } // Single appointments change less frequently
    );
  }, [cache]);

  /**
   * Update appointment with cache invalidation
   */
  const updateAppointment = useCallback(async (appointmentId, updateData) => {
    try {
      // Perform the update
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      const updatedAppointment = await response.json();
      
      // Update the single appointment cache
      const appointmentKey = createApiCacheKey('appointment', { id: appointmentId });
      cache.set(appointmentKey, updatedAppointment, TTL_PRESETS.LONG);
      
      // Invalidate related appointment lists
      cache.invalidate(INVALIDATION_PATTERNS.APPOINTMENTS());
      
      return updatedAppointment;
    } catch (error) {
      console.error('Failed to update appointment:', error);
      throw error;
    }
  }, [cache]);

  /**
   * Create new appointment with cache warming
   */
  const createAppointment = useCallback(async (appointmentData) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });
      
      const newAppointment = await response.json();
      
      // Warm cache with new appointment
      const appointmentKey = createApiCacheKey('appointment', { id: newAppointment.id });
      cache.set(appointmentKey, newAppointment, TTL_PRESETS.LONG);
      
      // Invalidate appointment lists to include new appointment
      cache.invalidate(INVALIDATION_PATTERNS.APPOINTMENTS());
      
      return newAppointment;
    } catch (error) {
      console.error('Failed to create appointment:', error);
      throw error;
    }
  }, [cache]);

  /**
   * Delete appointment with cache cleanup
   */
  const deleteAppointment = useCallback(async (appointmentId) => {
    try {
      await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE'
      });
      
      // Remove from cache
      const appointmentKey = createApiCacheKey('appointment', { id: appointmentId });
      cache.invalidate(appointmentKey);
      
      // Invalidate appointment lists
      cache.invalidate(INVALIDATION_PATTERNS.APPOINTMENTS());
      
      return true;
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      throw error;
    }
  }, [cache]);

  /**
   * Prefetch appointments for better UX
   */
  const prefetchAppointments = useCallback(async (userId) => {
    const cacheKey = createApiCacheKey('appointments', { userId });
    
    // Only prefetch if not already cached
    if (!cache.has(cacheKey)) {
      try {
        await getAppointments(userId);
      } catch (error) {
        console.warn('Prefetch failed:', error);
      }
    }
  }, [cache, getAppointments]);

  /**
   * Clear user-specific cache data
   */
  const clearUserCache = useCallback((userId) => {
    cache.invalidate(INVALIDATION_PATTERNS.USER_DATA(userId));
  }, [cache]);

  /**
   * Get cache performance statistics
   */
  const getCacheStats = useCallback(() => {
    return cache.getStats();
  }, [cache]);

  return {
    // Core operations
    getAppointments,
    getAppointment,
    updateAppointment,
    createAppointment,
    deleteAppointment,
    
    // Performance operations
    prefetchAppointments,
    clearUserCache,
    
    // Utilities
    getCacheStats,
    
    // Direct cache access for advanced usage
    cache
  };
};

/**
 * Example of integrating cache with existing useAppointments hook
 */
export const useOptimizedAppointmentsExample = () => {
  const cachedAppointments = useCachedAppointments();
  
  // This would replace the existing useAppointments implementation
  // with the cached version while maintaining the same interface
  
  return {
    ...cachedAppointments,
    
    // Additional optimizations
    refreshAppointments: cachedAppointments.getAppointments,
    
    // Batch operations with cache coordination
    batchUpdateAppointments: async (updates) => {
      const results = [];
      
      for (const { id, data } of updates) {
        try {
          const result = await cachedAppointments.updateAppointment(id, data);
          results.push({ id, success: true, data: result });
        } catch (error) {
          results.push({ id, success: false, error: error.message });
        }
      }
      
      return results;
    }
  };
};

export default useCachedAppointments;