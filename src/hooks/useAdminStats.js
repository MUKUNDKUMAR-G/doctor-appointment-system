import { useState, useEffect, useCallback, useRef } from 'react';
import { getSystemStats, getRecentActivity } from '../services/adminService';
import { useAdminRealTime } from '../contexts/AdminRealTimeContext';

/**
 * Hook for fetching and managing admin dashboard statistics
 * Provides real-time updates via WebSocket with polling fallback
 * 
 * @param {number} refreshInterval - Fallback polling interval in milliseconds (default: 30000)
 * @returns {Object} Statistics data and management functions
 */
export const useAdminStats = (refreshInterval = 30000) => {
  const [localStats, setLocalStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const isMountedRef = useRef(true);
  const intervalRef = useRef(null);
  
  // Get real-time stats from context
  const { stats: realtimeStats, connectionStatus, isConnected } = useAdminRealTime();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update local stats when real-time stats change
  useEffect(() => {
    if (realtimeStats) {
      setLocalStats(realtimeStats);
      setLastUpdated(new Date());
      setLoading(false);
    }
  }, [realtimeStats]);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both stats and recent activity in parallel
      const [statsData, activityData] = await Promise.all([
        getSystemStats(),
        getRecentActivity(5),
      ]);
      
      if (isMountedRef.current) {
        setLocalStats(statsData);
        // Handle paginated response from Spring Data
        const activities = activityData?.content || activityData || [];
        setRecentActivity(activities);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to load statistics');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Start auto-refresh
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchStats();
      }, refreshInterval);
    }
  }, [refreshInterval, fetchStats]);

  // Stop auto-refresh
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Manual refresh
  const refresh = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Initial fetch and setup auto-refresh only if not connected to WebSocket
  useEffect(() => {
    fetchStats();
    
    // Only use polling if WebSocket is not connected
    if (!isConnected && refreshInterval > 0) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [refreshInterval, fetchStats, startAutoRefresh, stopAutoRefresh, isConnected]);

  return {
    stats: localStats,
    recentActivity,
    loading,
    error,
    lastUpdated,
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
    connectionStatus,
    isConnected,
  };
};

export default useAdminStats;
