import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

// Cache for statistics data with TTL
const statisticsCache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes (shorter TTL for real-time data)

/**
 * Hook for managing doctor statistics with caching and real-time updates
 * Fetches and manages appointment statistics, patient feedback, and performance metrics
 * 
 * @param {number} doctorId - The ID of the doctor
 * @param {Object} dateRange - Optional date range filter { start: Date, end: Date }
 * @returns {Object} Statistics data and management functions
 */
export const useDoctorStatistics = (doctorId, dateRange = null) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  
  // Track if component is mounted
  const isMountedRef = useRef(true);
  
  // Polling interval for real-time updates
  const pollingIntervalRef = useRef(null);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Generate cache key based on doctorId and date range
  const getCacheKey = useCallback(() => {
    if (!dateRange) {
      return `statistics_${doctorId}`;
    }
    const startStr = dateRange.start ? dateRange.start.toISOString().split('T')[0] : 'null';
    const endStr = dateRange.end ? dateRange.end.toISOString().split('T')[0] : 'null';
    return `statistics_${doctorId}_${startStr}_${endStr}`;
  }, [doctorId, dateRange]);

  // Check cache for statistics data
  const getCachedStatistics = useCallback((key) => {
    const cached = statisticsCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    statisticsCache.delete(key);
    return null;
  }, []);

  // Set cache for statistics data
  const setCachedStatistics = useCallback((key, data) => {
    statisticsCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  // Fetch doctor statistics with caching
  const fetchStatistics = useCallback(async (forceRefresh = false) => {
    if (!doctorId) return;

    const cacheKey = getCacheKey();
    
    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = getCachedStatistics(cacheKey);
      if (cached && isMountedRef.current) {
        setStatistics(cached.statistics);
        setAnalytics(cached.analytics);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = {};
      if (dateRange?.start) {
        params.startDate = dateRange.start.toISOString().split('T')[0];
      }
      if (dateRange?.end) {
        params.endDate = dateRange.end.toISOString().split('T')[0];
      }

      // Fetch statistics
      const statsResponse = await api.get(`/doctors/${doctorId}/statistics`, { params });
      
      if (!isMountedRef.current) return;
      
      const statsData = statsResponse.data;
      setStatistics(statsData);

      // Fetch analytics if available
      let analyticsData = null;
      try {
        const analyticsResponse = await api.get(`/doctors/profile/${doctorId}/analytics`, { params });
        analyticsData = analyticsResponse.data;
        if (isMountedRef.current) {
          setAnalytics(analyticsData);
        }
      } catch (err) {
        console.warn('Failed to fetch analytics:', err);
        if (isMountedRef.current) {
          setAnalytics(null);
        }
      }

      // Cache the results
      setCachedStatistics(cacheKey, {
        statistics: statsData,
        analytics: analyticsData,
      });
    } catch (err) {
      console.error('Error fetching doctor statistics:', err);
      if (isMountedRef.current) {
        setError('Failed to load statistics');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [doctorId, dateRange, getCacheKey, getCachedStatistics, setCachedStatistics]);

  // Start real-time polling for statistics updates
  const startPolling = useCallback((interval = 30000) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(() => {
      fetchStatistics(true); // Force refresh on poll
    }, interval);
  }, [fetchStatistics]);

  // Stop real-time polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Refresh statistics
  const refresh = useCallback(async () => {
    await fetchStatistics(true);
  }, [fetchStatistics]);

  // Clear cache for this doctor
  const clearCache = useCallback(() => {
    const cacheKey = getCacheKey();
    statisticsCache.delete(cacheKey);
  }, [getCacheKey]);

  // Initial fetch
  useEffect(() => {
    if (doctorId) {
      fetchStatistics(false); // Use cache on initial load
    }
  }, [doctorId, dateRange]); // Re-fetch when date range changes

  return {
    loading,
    error,
    statistics,
    analytics,
    refresh,
    clearCache,
    startPolling,
    stopPolling,
  };
};

export default useDoctorStatistics;
