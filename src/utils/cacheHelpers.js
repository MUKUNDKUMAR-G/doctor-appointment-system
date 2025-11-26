/**
 * Cache Helper Utilities
 * 
 * Utility functions to work with the useCache hook for common caching patterns
 */

/**
 * Cache key generators for consistent naming
 */
export const createCacheKey = (service, method, ...params) => {
  const paramStr = params.length > 0 ? `_${params.join('_')}` : '';
  return `${service}_${method}${paramStr}`;
};

/**
 * Create cache key for API endpoints
 */
export const createApiCacheKey = (endpoint, params = {}) => {
  const paramStr = Object.keys(params).length > 0 
    ? `_${Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')}` 
    : '';
  return `api_${endpoint.replace(/\//g, '_')}${paramStr}`;
};

/**
 * Create cache key for user-specific data
 */
export const createUserCacheKey = (userId, dataType, ...params) => {
  return createCacheKey('user', `${userId}_${dataType}`, ...params);
};

/**
 * TTL presets for different types of data
 */
export const TTL_PRESETS = {
  // Very short-lived data (30 seconds)
  REALTIME: 30 * 1000,
  
  // Short-lived data (2 minutes)
  SHORT: 2 * 60 * 1000,
  
  // Medium-lived data (5 minutes) - default
  MEDIUM: 5 * 60 * 1000,
  
  // Long-lived data (15 minutes)
  LONG: 15 * 60 * 1000,
  
  // Very long-lived data (1 hour)
  VERY_LONG: 60 * 60 * 1000,
  
  // Static data (24 hours)
  STATIC: 24 * 60 * 60 * 1000
};

/**
 * Cache invalidation patterns
 */
export const INVALIDATION_PATTERNS = {
  // Invalidate all user data
  USER_DATA: (userId) => new RegExp(`user_${userId}_`),
  
  // Invalidate all API data
  API_DATA: () => /^api_/,
  
  // Invalidate specific service data
  SERVICE_DATA: (service) => new RegExp(`^${service}_`),
  
  // Invalidate by endpoint
  ENDPOINT_DATA: (endpoint) => new RegExp(`api_${endpoint.replace(/\//g, '_')}`),
  
  // Invalidate all appointment data
  APPOINTMENTS: () => /appointment/i,
  
  // Invalidate all profile data
  PROFILE: () => /profile/i
};

/**
 * Create a cached API function
 */
export const createCachedApiFunction = (cache, apiFunction, options = {}) => {
  const {
    keyGenerator = createApiCacheKey,
    ttl = TTL_PRESETS.MEDIUM,
    useStaleWhileRevalidate = true
  } = options;

  return async (...args) => {
    const cacheKey = keyGenerator(...args);
    
    if (useStaleWhileRevalidate) {
      return cache.getStaleWhileRevalidate(
        cacheKey,
        () => apiFunction(...args),
        { ttl }
      );
    } else {
      const cached = cache.get(cacheKey);
      if (cached && !cached.isStale) {
        return cached.data;
      }
      
      const result = await apiFunction(...args);
      cache.set(cacheKey, result, ttl);
      return result;
    }
  };
};

/**
 * Create a cache wrapper for a service object
 */
export const wrapServiceWithCache = (cache, service, options = {}) => {
  const {
    ttlMap = {},
    defaultTTL = TTL_PRESETS.MEDIUM,
    useStaleWhileRevalidate = true
  } = options;

  const wrappedService = {};
  
  Object.keys(service).forEach(methodName => {
    const originalMethod = service[methodName];
    const ttl = ttlMap[methodName] || defaultTTL;
    
    wrappedService[methodName] = createCachedApiFunction(
      cache,
      originalMethod.bind(service),
      {
        keyGenerator: (...args) => createCacheKey('service', methodName, ...args),
        ttl,
        useStaleWhileRevalidate
      }
    );
  });
  
  return wrappedService;
};

/**
 * Cache warming utilities
 */
export const cacheWarming = {
  /**
   * Warm cache with multiple keys
   */
  warmMultiple: async (cache, warmingMap) => {
    const promises = Object.entries(warmingMap).map(async ([key, fetchFn]) => {
      try {
        const data = await fetchFn();
        cache.set(key, data);
        return { key, success: true };
      } catch (error) {
        console.warn(`Cache warming failed for key "${key}":`, error);
        return { key, success: false, error };
      }
    });
    
    return Promise.all(promises);
  },

  /**
   * Warm cache for user data
   */
  warmUserData: async (cache, userId, dataFetchers) => {
    const warmingMap = {};
    
    Object.entries(dataFetchers).forEach(([dataType, fetchFn]) => {
      const key = createUserCacheKey(userId, dataType);
      warmingMap[key] = fetchFn;
    });
    
    return cacheWarming.warmMultiple(cache, warmingMap);
  }
};

/**
 * Cache health monitoring
 */
export const cacheHealth = {
  /**
   * Check cache health and performance
   */
  checkHealth: (cache) => {
    const stats = cache.getStats();
    const keys = cache.getKeys();
    
    return {
      ...stats,
      health: {
        hitRateGood: stats.hitRate >= 70,
        sizeReasonable: stats.size < 80, // Assuming max size of 100
        totalRequestsSignificant: stats.totalRequests >= 10
      },
      recommendations: generateRecommendations(stats, keys.length)
    };
  },

  /**
   * Generate performance recommendations
   */
  generateRecommendations: (stats, keyCount) => {
    const recommendations = [];
    
    if (stats.hitRate < 50) {
      recommendations.push('Low cache hit rate - consider increasing TTL or improving cache key strategy');
    }
    
    if (stats.evictions > stats.sets * 0.1) {
      recommendations.push('High eviction rate - consider increasing cache size');
    }
    
    if (keyCount > 80) {
      recommendations.push('Cache approaching size limit - monitor for performance impact');
    }
    
    return recommendations;
  }
};

/**
 * Generate performance recommendations
 */
const generateRecommendations = (stats, keyCount) => {
  const recommendations = [];
  
  if (stats.hitRate < 50) {
    recommendations.push('Low cache hit rate - consider increasing TTL or improving cache key strategy');
  }
  
  if (stats.evictions > stats.sets * 0.1) {
    recommendations.push('High eviction rate - consider increasing cache size');
  }
  
  if (keyCount > 80) {
    recommendations.push('Cache approaching size limit - monitor for performance impact');
  }
  
  return recommendations;
};

/**
 * Cache debugging utilities
 */
export const cacheDebug = {
  /**
   * Log cache contents for debugging
   */
  logCacheContents: (cache, filter = null) => {
    const keys = cache.getKeys();
    const filteredKeys = filter ? keys.filter(filter) : keys;
    
    console.group('Cache Contents');
    filteredKeys.forEach(key => {
      const entry = cache.getEntry(key);
      if (entry) {
        console.log(`${key}:`, {
          status: entry.status,
          isStale: entry.isStale,
          accessCount: entry.accessCount,
          age: Date.now() - entry.timestamp
        });
      }
    });
    console.groupEnd();
  },

  /**
   * Monitor cache performance over time
   */
  createPerformanceMonitor: (cache, interval = 30000) => {
    const monitor = {
      history: [],
      intervalId: null
    };

    monitor.start = () => {
      monitor.intervalId = setInterval(() => {
        const stats = cache.getStats();
        monitor.history.push({
          timestamp: Date.now(),
          ...stats
        });
        
        // Keep only last 100 entries
        if (monitor.history.length > 100) {
          monitor.history.shift();
        }
      }, interval);
    };

    monitor.stop = () => {
      if (monitor.intervalId) {
        clearInterval(monitor.intervalId);
        monitor.intervalId = null;
      }
    };

    monitor.getReport = () => {
      if (monitor.history.length < 2) return null;
      
      const latest = monitor.history[monitor.history.length - 1];
      const previous = monitor.history[monitor.history.length - 2];
      
      return {
        current: latest,
        changes: {
          hitRate: latest.hitRate - previous.hitRate,
          size: latest.size - previous.size,
          totalRequests: latest.totalRequests - previous.totalRequests
        },
        trend: monitor.history.slice(-10) // Last 10 entries
      };
    };

    return monitor;
  }
};

export default {
  createCacheKey,
  createApiCacheKey,
  createUserCacheKey,
  TTL_PRESETS,
  INVALIDATION_PATTERNS,
  createCachedApiFunction,
  wrapServiceWithCache,
  cacheWarming,
  cacheHealth,
  cacheDebug
};