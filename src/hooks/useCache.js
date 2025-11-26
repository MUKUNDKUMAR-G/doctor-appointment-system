import { useRef, useCallback, useEffect } from 'react';

// Default cache configuration
const DEFAULT_CONFIG = {
  maxSize: 100,           // Maximum number of cache entries
  defaultTTL: 300000,     // Default TTL: 5 minutes
  staleTime: 60000,       // Time before data is considered stale: 1 minute
  gcInterval: 60000,      // Garbage collection interval: 1 minute
  enableGC: true          // Enable automatic garbage collection
};

// Cache entry status
const CACHE_STATUS = {
  FRESH: 'fresh',
  STALE: 'stale',
  EXPIRED: 'expired'
};

export const useCache = (config = {}) => {
  const cacheConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Cache storage - Map maintains insertion order for LRU
  const cache = useRef(new Map());
  
  // Revalidation promises to prevent duplicate requests
  const revalidationPromises = useRef(new Map());
  
  // Statistics tracking
  const stats = useRef({
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
    gcRuns: 0
  });

  /**
   * Create a cache entry object
   */
  const createCacheEntry = useCallback((data, ttl = cacheConfig.defaultTTL) => {
    const now = Date.now();
    return {
      data,
      timestamp: now,
      ttl,
      expiresAt: now + ttl,
      staleAt: now + cacheConfig.staleTime,
      accessCount: 1,
      lastAccessed: now
    };
  }, [cacheConfig.defaultTTL, cacheConfig.staleTime]);

  /**
   * Get cache entry status
   */
  const getCacheStatus = useCallback((entry) => {
    if (!entry) return null;
    
    const now = Date.now();
    
    if (now > entry.expiresAt) {
      return CACHE_STATUS.EXPIRED;
    } else if (now > entry.staleAt) {
      return CACHE_STATUS.STALE;
    } else {
      return CACHE_STATUS.FRESH;
    }
  }, []);

  /**
   * Update access information for LRU
   */
  const updateAccess = useCallback((key, entry) => {
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    // Move to end for LRU (most recently used)
    cache.current.delete(key);
    cache.current.set(key, entry);
  }, []);

  /**
   * Evict least recently used entries when cache is full
   */
  const evictLRU = useCallback(() => {
    while (cache.current.size >= cacheConfig.maxSize) {
      // Get the first (oldest) entry
      const [oldestKey] = cache.current.keys();
      cache.current.delete(oldestKey);
      stats.current.evictions++;
    }
  }, [cacheConfig.maxSize]);

  /**
   * Garbage collection - remove expired entries
   */
  const garbageCollect = useCallback(() => {
    const now = Date.now();
    const keysToDelete = [];
    
    cache.current.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => cache.current.delete(key));
    stats.current.gcRuns++;
    
    return keysToDelete.length;
  }, []);

  /**
   * Get cached data
   */
  const get = useCallback((key) => {
    const entry = cache.current.get(key);
    
    if (!entry) {
      stats.current.misses++;
      return null;
    }

    const status = getCacheStatus(entry);
    
    if (status === CACHE_STATUS.EXPIRED) {
      cache.current.delete(key);
      stats.current.misses++;
      return null;
    }

    // Update access for LRU
    updateAccess(key, entry);
    stats.current.hits++;

    return {
      data: entry.data,
      timestamp: entry.timestamp,
      isStale: status === CACHE_STATUS.STALE,
      status
    };
  }, [getCacheStatus, updateAccess]);

  /**
   * Set cached data with TTL
   */
  const set = useCallback((key, data, ttl) => {
    // Evict LRU entries if needed
    evictLRU();
    
    const entry = createCacheEntry(data, ttl);
    cache.current.set(key, entry);
    stats.current.sets++;
  }, [createCacheEntry, evictLRU]);

  /**
   * Invalidate cache entries by pattern
   */
  const invalidate = useCallback((pattern) => {
    const keysToDelete = [];
    
    if (typeof pattern === 'string') {
      // Simple string matching
      cache.current.forEach((_, key) => {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      });
    } else if (pattern instanceof RegExp) {
      // Regex pattern matching
      cache.current.forEach((_, key) => {
        if (pattern.test(key)) {
          keysToDelete.push(key);
        }
      });
    } else if (typeof pattern === 'function') {
      // Function-based matching
      cache.current.forEach((entry, key) => {
        if (pattern(key, entry)) {
          keysToDelete.push(key);
        }
      });
    }
    
    keysToDelete.forEach(key => cache.current.delete(key));
    return keysToDelete.length;
  }, []);

  /**
   * Get stale data while revalidating in background
   */
  const getStaleWhileRevalidate = useCallback(async (key, fetchFn, options = {}) => {
    const { ttl, forceRevalidate = false } = options;
    const cachedResult = get(key);
    
    // If we have fresh data and not forcing revalidation, return it
    if (cachedResult && cachedResult.status === CACHE_STATUS.FRESH && !forceRevalidate) {
      return cachedResult.data;
    }
    
    // If we have stale data, return it and revalidate in background
    if (cachedResult && cachedResult.isStale && !forceRevalidate) {
      // Start background revalidation if not already in progress
      if (!revalidationPromises.current.has(key)) {
        const revalidationPromise = fetchFn()
          .then(newData => {
            set(key, newData, ttl);
            return newData;
          })
          .catch(error => {
            console.warn(`Background revalidation failed for key "${key}":`, error);
            // Keep stale data on revalidation failure
            return cachedResult.data;
          })
          .finally(() => {
            revalidationPromises.current.delete(key);
          });
        
        revalidationPromises.current.set(key, revalidationPromise);
      }
      
      return cachedResult.data;
    }
    
    // No cache or expired data - fetch fresh data
    try {
      const freshData = await fetchFn();
      set(key, freshData, ttl);
      return freshData;
    } catch (error) {
      // If fetch fails and we have stale data, return stale data
      if (cachedResult) {
        console.warn(`Fetch failed for key "${key}", returning stale data:`, error);
        return cachedResult.data;
      }
      throw error;
    }
  }, [get, set]);

  /**
   * Clear all cache entries
   */
  const clear = useCallback(() => {
    const size = cache.current.size;
    cache.current.clear();
    revalidationPromises.current.clear();
    return size;
  }, []);

  /**
   * Get cache statistics
   */
  const getStats = useCallback(() => {
    const totalRequests = stats.current.hits + stats.current.misses;
    const hitRate = totalRequests > 0 ? (stats.current.hits / totalRequests) * 100 : 0;
    
    return {
      ...stats.current,
      size: cache.current.size,
      hitRate: Math.round(hitRate * 100) / 100,
      totalRequests
    };
  }, []);

  /**
   * Get all cache keys (for debugging)
   */
  const getKeys = useCallback(() => {
    return Array.from(cache.current.keys());
  }, []);

  /**
   * Check if key exists in cache
   */
  const has = useCallback((key) => {
    const entry = cache.current.get(key);
    if (!entry) return false;
    
    const status = getCacheStatus(entry);
    return status !== CACHE_STATUS.EXPIRED;
  }, [getCacheStatus]);

  /**
   * Get cache entry with full metadata
   */
  const getEntry = useCallback((key) => {
    const entry = cache.current.get(key);
    if (!entry) return null;
    
    const status = getCacheStatus(entry);
    if (status === CACHE_STATUS.EXPIRED) {
      cache.current.delete(key);
      return null;
    }
    
    return {
      ...entry,
      status,
      isStale: status === CACHE_STATUS.STALE
    };
  }, [getCacheStatus]);

  // Set up garbage collection interval
  useEffect(() => {
    if (!cacheConfig.enableGC) return;
    
    const gcInterval = setInterval(() => {
      garbageCollect();
    }, cacheConfig.gcInterval);
    
    return () => clearInterval(gcInterval);
  }, [cacheConfig.enableGC, cacheConfig.gcInterval, garbageCollect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  return {
    // Core cache operations
    get,
    set,
    invalidate,
    clear,
    has,
    
    // Advanced operations
    getStaleWhileRevalidate,
    getEntry,
    
    // Utilities
    getStats,
    getKeys,
    garbageCollect,
    
    // Constants
    CACHE_STATUS
  };
};

export default useCache;