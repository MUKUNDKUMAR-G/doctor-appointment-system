import { useRef, useCallback, useEffect, useState } from 'react';

// Default configuration
const DEFAULT_CONFIG = {
  debounceDelay: 200,      // Delay before showing loading indicator (prevents flicker)
  minLoadingDuration: 300, // Minimum time to show loading indicator once shown
  enableDebounce: true,    // Enable debouncing
  enableMinDuration: true  // Enable minimum duration
};

export const useLoadingCoordinator = (config = {}) => {
  const coordinatorConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Store loading states by key
  const loadingStates = useRef(new Map());
  
  // Store debounce timers
  const debounceTimers = useRef(new Map());
  
  // Store minimum duration timers
  const minDurationTimers = useRef(new Map());
  
  // Force re-render when loading states change
  const [, forceUpdate] = useState({});
  const triggerUpdate = useCallback(() => forceUpdate({}), []);
  
  // Statistics tracking
  const stats = useRef({
    totalOperations: 0,
    activeOperations: 0,
    debouncedOperations: 0,
    completedOperations: 0
  });

  /**
   * Create a loading state entry
   */
  const createLoadingState = useCallback((key) => {
    return {
      key,
      active: false,
      visible: false,        // Whether loading indicator is actually shown
      startTime: null,
      visibleStartTime: null, // When loading indicator became visible
      requestCount: 0,
      debounceTimer: null,
      minDurationTimer: null
    };
  }, []);

  /**
   * Get or create loading state for a key
   */
  const getLoadingState = useCallback((key) => {
    if (!loadingStates.current.has(key)) {
      loadingStates.current.set(key, createLoadingState(key));
    }
    return loadingStates.current.get(key);
  }, [createLoadingState]);

  /**
   * Clear debounce timer for a key
   */
  const clearDebounceTimer = useCallback((key) => {
    const timer = debounceTimers.current.get(key);
    if (timer) {
      clearTimeout(timer);
      debounceTimers.current.delete(key);
    }
  }, []);

  /**
   * Clear minimum duration timer for a key
   */
  const clearMinDurationTimer = useCallback((key) => {
    const timer = minDurationTimers.current.get(key);
    if (timer) {
      clearTimeout(timer);
      minDurationTimers.current.delete(key);
    }
  }, []);

  /**
   * Make loading indicator visible
   */
  const showLoadingIndicator = useCallback((key) => {
    const state = getLoadingState(key);
    if (!state.visible) {
      state.visible = true;
      state.visibleStartTime = Date.now();
      triggerUpdate();
    }
  }, [getLoadingState, triggerUpdate]);

  /**
   * Hide loading indicator (respecting minimum duration)
   */
  const hideLoadingIndicator = useCallback((key) => {
    const state = getLoadingState(key);
    
    if (!state.visible) {
      return;
    }

    // Calculate how long the indicator has been visible
    const visibleDuration = Date.now() - (state.visibleStartTime || 0);
    const remainingTime = coordinatorConfig.minLoadingDuration - visibleDuration;

    if (coordinatorConfig.enableMinDuration && remainingTime > 0) {
      // Wait for minimum duration before hiding
      const timer = setTimeout(() => {
        state.visible = false;
        state.visibleStartTime = null;
        minDurationTimers.current.delete(key);
        triggerUpdate();
      }, remainingTime);
      
      minDurationTimers.current.set(key, timer);
    } else {
      // Hide immediately
      state.visible = false;
      state.visibleStartTime = null;
      triggerUpdate();
    }
  }, [getLoadingState, coordinatorConfig.minLoadingDuration, coordinatorConfig.enableMinDuration, triggerUpdate]);

  /**
   * Set loading state for a specific operation
   */
  const setLoading = useCallback((key, loading) => {
    const state = getLoadingState(key);
    
    if (loading) {
      // Start loading
      if (!state.active) {
        state.active = true;
        state.startTime = Date.now();
        state.requestCount = 1;
        stats.current.totalOperations++;
        stats.current.activeOperations++;
        
        // Clear any existing timers
        clearDebounceTimer(key);
        clearMinDurationTimer(key);
        
        if (coordinatorConfig.enableDebounce) {
          // Debounce: only show loading indicator after delay
          const timer = setTimeout(() => {
            showLoadingIndicator(key);
            debounceTimers.current.delete(key);
          }, coordinatorConfig.debounceDelay);
          
          debounceTimers.current.set(key, timer);
          stats.current.debouncedOperations++;
        } else {
          // Show immediately
          showLoadingIndicator(key);
        }
      } else {
        // Increment request count for deduplication tracking
        state.requestCount++;
      }
    } else {
      // Stop loading
      if (state.active) {
        state.requestCount = Math.max(0, state.requestCount - 1);
        
        // Only stop loading when all requests for this key are complete
        if (state.requestCount === 0) {
          state.active = false;
          stats.current.activeOperations--;
          stats.current.completedOperations++;
          
          // Clear debounce timer if loading never became visible
          clearDebounceTimer(key);
          
          // Hide loading indicator (respecting minimum duration)
          if (state.visible) {
            hideLoadingIndicator(key);
          }
        }
      }
    }
  }, [
    getLoadingState,
    clearDebounceTimer,
    clearMinDurationTimer,
    showLoadingIndicator,
    hideLoadingIndicator,
    coordinatorConfig.enableDebounce,
    coordinatorConfig.debounceDelay
  ]);

  /**
   * Check if loading for a specific key or any operation
   */
  const isLoading = useCallback((key) => {
    if (!key) {
      // Check if any operation is loading
      for (const state of loadingStates.current.values()) {
        if (state.visible) {
          return true;
        }
      }
      return false;
    }
    
    const state = loadingStates.current.get(key);
    return state ? state.visible : false;
  }, []);

  /**
   * Check if loading is active (but may not be visible yet due to debounce)
   */
  const isLoadingActive = useCallback((key) => {
    if (!key) {
      // Check if any operation is active
      for (const state of loadingStates.current.values()) {
        if (state.active) {
          return true;
        }
      }
      return false;
    }
    
    const state = loadingStates.current.get(key);
    return state ? state.active : false;
  }, []);

  /**
   * Get all loading operations (visible ones)
   */
  const getLoadingOperations = useCallback(() => {
    const operations = [];
    loadingStates.current.forEach((state, key) => {
      if (state.visible) {
        operations.push(key);
      }
    });
    return operations;
  }, []);

  /**
   * Get all active operations (including debounced ones)
   */
  const getActiveOperations = useCallback(() => {
    const operations = [];
    loadingStates.current.forEach((state, key) => {
      if (state.active) {
        operations.push({
          key,
          visible: state.visible,
          duration: Date.now() - (state.startTime || 0),
          requestCount: state.requestCount
        });
      }
    });
    return operations;
  }, []);

  /**
   * Clear loading state for a specific key
   */
  const clearLoading = useCallback((key) => {
    const state = loadingStates.current.get(key);
    if (state) {
      clearDebounceTimer(key);
      clearMinDurationTimer(key);
      
      if (state.active) {
        stats.current.activeOperations--;
      }
      
      loadingStates.current.delete(key);
      triggerUpdate();
    }
  }, [clearDebounceTimer, clearMinDurationTimer, triggerUpdate]);

  /**
   * Clear all loading states
   */
  const clearAll = useCallback(() => {
    // Clear all timers
    debounceTimers.current.forEach((timer) => clearTimeout(timer));
    minDurationTimers.current.forEach((timer) => clearTimeout(timer));
    
    debounceTimers.current.clear();
    minDurationTimers.current.clear();
    loadingStates.current.clear();
    
    stats.current.activeOperations = 0;
    triggerUpdate();
  }, [triggerUpdate]);

  /**
   * Get loading statistics
   */
  const getStats = useCallback(() => {
    return {
      ...stats.current,
      loadingStates: loadingStates.current.size,
      visibleOperations: getLoadingOperations().length
    };
  }, [getLoadingOperations]);

  /**
   * Get loading state details for a key
   */
  const getLoadingDetails = useCallback((key) => {
    const state = loadingStates.current.get(key);
    if (!state) return null;
    
    return {
      key: state.key,
      active: state.active,
      visible: state.visible,
      duration: state.startTime ? Date.now() - state.startTime : 0,
      visibleDuration: state.visibleStartTime ? Date.now() - state.visibleStartTime : 0,
      requestCount: state.requestCount
    };
  }, []);

  /**
   * Wrap an async operation with automatic loading state management
   */
  const withLoading = useCallback(async (key, operation) => {
    setLoading(key, true);
    try {
      const result = await operation();
      return result;
    } finally {
      setLoading(key, false);
    }
  }, [setLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAll();
    };
  }, [clearAll]);

  return {
    // Core operations
    setLoading,
    isLoading,
    isLoadingActive,
    
    // Query operations
    getLoadingOperations,
    getActiveOperations,
    getLoadingDetails,
    
    // Management operations
    clearLoading,
    clearAll,
    
    // Utilities
    withLoading,
    getStats
  };
};

export default useLoadingCoordinator;
