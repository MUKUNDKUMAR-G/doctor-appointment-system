import { useState, useEffect, useCallback, useRef } from 'react';
import { getAuditLogs } from '../services/auditService';

/**
 * Hook for fetching and filtering audit logs with pagination
 * Provides comprehensive filtering and search capabilities
 * 
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Audit logs data and management functions
 */
export const useAuditLog = (initialFilters = {}) => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  });

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchLogs = useCallback(async (page = pagination.page, size = pagination.size) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await getAuditLogs(filters, page, size);
      
      if (isMountedRef.current) {
        setLogs(response.content || response);
        setPagination({
          page: response.number || page,
          size: response.size || size,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
        });
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }
      
      console.error('Error fetching audit logs:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to load audit logs');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      abortControllerRef.current = null;
    }
  }, [filters, pagination.page, pagination.size]);

  // Update a single filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 0 }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 0 }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setPagination(prev => ({ ...prev, page: 0 }));
  }, [initialFilters]);

  // Clear a specific filter
  const clearFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    setPagination(prev => ({ ...prev, page: 0 }));
  }, []);

  // Go to specific page
  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Go to next page
  const nextPage = useCallback(() => {
    setPagination(prev => {
      if (prev.page < prev.totalPages - 1) {
        return { ...prev, page: prev.page + 1 };
      }
      return prev;
    });
  }, []);

  // Go to previous page
  const previousPage = useCallback(() => {
    setPagination(prev => {
      if (prev.page > 0) {
        return { ...prev, page: prev.page - 1 };
      }
      return prev;
    });
  }, []);

  // Change page size
  const changePageSize = useCallback((size) => {
    setPagination(prev => ({ ...prev, size, page: 0 }));
  }, []);

  // Refresh current page
  const refresh = useCallback(async () => {
    await fetchLogs(pagination.page, pagination.size);
  }, [fetchLogs, pagination.page, pagination.size]);

  // Check if a filter is active
  const isFilterActive = useCallback((key) => {
    return filters[key] !== undefined && filters[key] !== null && filters[key] !== '';
  }, [filters]);

  // Get count of active filters
  const getActiveFilterCount = useCallback(() => {
    return Object.keys(filters).filter(key => isFilterActive(key)).length;
  }, [filters, isFilterActive]);

  // Fetch logs when filters or pagination changes
  useEffect(() => {
    fetchLogs(pagination.page, pagination.size);
  }, [filters, pagination.page, pagination.size]);

  return {
    logs,
    loading,
    error,
    filters,
    pagination,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    refresh,
    isFilterActive,
    getActiveFilterCount,
    hasNextPage: pagination.page < pagination.totalPages - 1,
    hasPreviousPage: pagination.page > 0,
  };
};

export default useAuditLog;
