import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getDashboardAnalytics,
  getAppointmentTrends,
  getUserGrowth,
  getSystemHealth,
  getDoctorPerformance,
} from '../services/analyticsService';

/**
 * Hook for managing analytics data with date range filtering
 * Provides comprehensive analytics data management and caching
 * 
 * @param {Object} initialDateRange - Initial date range { start: Date, end: Date }
 * @returns {Object} Analytics data and management functions
 */
export const useAnalytics = (initialDateRange = null) => {
  const [dateRange, setDateRange] = useState(initialDateRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Individual analytics data states
  const [dashboardData, setDashboardData] = useState(null);
  const [appointmentTrends, setAppointmentTrends] = useState(null);
  const [userGrowth, setUserGrowth] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [doctorPerformance, setDoctorPerformance] = useState(null);

  // Loading states for individual analytics
  const [loadingStates, setLoadingStates] = useState({
    dashboard: false,
    trends: false,
    growth: false,
    health: false,
    performance: false,
  });

  const isMountedRef = useRef(true);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Generate cache key
  const getCacheKey = useCallback((type, params = {}) => {
    const paramsStr = JSON.stringify(params);
    return `${type}_${paramsStr}`;
  }, []);

  // Get cached data
  const getCachedData = useCallback((key, ttl = 5 * 60 * 1000) => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    cacheRef.current.delete(key);
    return null;
  }, []);

  // Set cached data
  const setCachedData = useCallback((key, data) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Fetch dashboard analytics
  const fetchDashboardAnalytics = useCallback(async (forceRefresh = false) => {
    const cacheKey = getCacheKey('dashboard', dateRange);
    
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached && isMountedRef.current) {
        setDashboardData(cached);
        return cached;
      }
    }

    setLoadingStates(prev => ({ ...prev, dashboard: true }));

    try {
      const startDate = dateRange?.start?.toISOString().split('T')[0];
      const endDate = dateRange?.end?.toISOString().split('T')[0];
      
      const data = await getDashboardAnalytics(startDate, endDate);
      
      if (isMountedRef.current) {
        setDashboardData(data);
        setCachedData(cacheKey, data);
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching dashboard analytics:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to load dashboard analytics');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoadingStates(prev => ({ ...prev, dashboard: false }));
      }
    }
  }, [dateRange, getCacheKey, getCachedData, setCachedData]);

  // Fetch appointment trends
  const fetchAppointmentTrends = useCallback(async (period = '30d', forceRefresh = false) => {
    const cacheKey = getCacheKey('trends', { period });
    
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached && isMountedRef.current) {
        setAppointmentTrends(cached);
        return cached;
      }
    }

    setLoadingStates(prev => ({ ...prev, trends: true }));

    try {
      const data = await getAppointmentTrends(period);
      
      if (isMountedRef.current) {
        setAppointmentTrends(data);
        setCachedData(cacheKey, data);
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching appointment trends:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to load appointment trends');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoadingStates(prev => ({ ...prev, trends: false }));
      }
    }
  }, [getCacheKey, getCachedData, setCachedData]);

  // Fetch user growth
  const fetchUserGrowth = useCallback(async (period = '12m', forceRefresh = false) => {
    const cacheKey = getCacheKey('growth', { period });
    
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached && isMountedRef.current) {
        setUserGrowth(cached);
        return cached;
      }
    }

    setLoadingStates(prev => ({ ...prev, growth: true }));

    try {
      const data = await getUserGrowth(period);
      
      if (isMountedRef.current) {
        setUserGrowth(data);
        setCachedData(cacheKey, data);
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching user growth:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to load user growth');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoadingStates(prev => ({ ...prev, growth: false }));
      }
    }
  }, [getCacheKey, getCachedData, setCachedData]);

  // Fetch system health
  const fetchSystemHealth = useCallback(async (forceRefresh = false) => {
    const cacheKey = getCacheKey('health');
    
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey, 2 * 60 * 1000); // 2 min TTL for health
      if (cached && isMountedRef.current) {
        setSystemHealth(cached);
        return cached;
      }
    }

    setLoadingStates(prev => ({ ...prev, health: true }));

    try {
      const data = await getSystemHealth();
      
      if (isMountedRef.current) {
        setSystemHealth(data);
        setCachedData(cacheKey, data);
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching system health:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to load system health');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoadingStates(prev => ({ ...prev, health: false }));
      }
    }
  }, [getCacheKey, getCachedData, setCachedData]);

  // Fetch doctor performance
  const fetchDoctorPerformance = useCallback(async (forceRefresh = false) => {
    const cacheKey = getCacheKey('performance');
    
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached && isMountedRef.current) {
        setDoctorPerformance(cached);
        return cached;
      }
    }

    setLoadingStates(prev => ({ ...prev, performance: true }));

    try {
      const data = await getDoctorPerformance();
      
      if (isMountedRef.current) {
        setDoctorPerformance(data);
        setCachedData(cacheKey, data);
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching doctor performance:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to load doctor performance');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoadingStates(prev => ({ ...prev, performance: false }));
      }
    }
  }, [getCacheKey, getCachedData, setCachedData]);

  // Fetch all analytics data
  const fetchAllAnalytics = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchDashboardAnalytics(forceRefresh),
        fetchAppointmentTrends('30d', forceRefresh),
        fetchUserGrowth('12m', forceRefresh),
        fetchSystemHealth(forceRefresh),
        fetchDoctorPerformance(forceRefresh),
      ]);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [
    fetchDashboardAnalytics,
    fetchAppointmentTrends,
    fetchUserGrowth,
    fetchSystemHealth,
    fetchDoctorPerformance,
  ]);

  // Update date range
  const updateDateRange = useCallback((newDateRange) => {
    setDateRange(newDateRange);
  }, []);

  // Refresh all data
  const refresh = useCallback(async () => {
    await fetchAllAnalytics(true);
  }, [fetchAllAnalytics]);

  // Initial fetch
  useEffect(() => {
    fetchAllAnalytics(false);
  }, [dateRange]);

  return {
    // Data
    dashboardData,
    appointmentTrends,
    userGrowth,
    systemHealth,
    doctorPerformance,
    
    // State
    loading,
    loadingStates,
    error,
    dateRange,
    
    // Actions
    updateDateRange,
    refresh,
    clearCache,
    
    // Individual fetchers
    fetchDashboardAnalytics,
    fetchAppointmentTrends,
    fetchUserGrowth,
    fetchSystemHealth,
    fetchDoctorPerformance,
  };
};

export default useAnalytics;
