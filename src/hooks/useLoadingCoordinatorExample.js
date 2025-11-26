/**
 * Loading Coordinator Usage Examples
 * 
 * This file demonstrates various ways to use the useLoadingCoordinator hook
 * for centralized loading state management with deduplication and debouncing.
 */

import { useLoadingCoordinator } from './useLoadingCoordinator';
import {
  LOADING_KEYS,
  DEBOUNCE_PRESETS,
  appointmentLoadingKey,
  createLoadingConfig,
  formatLoadingDuration
} from '../utils/loadingCoordinatorHelpers';

/**
 * Example 1: Basic Loading State Management
 */
export const BasicLoadingExample = () => {
  const loadingCoordinator = useLoadingCoordinator();
  
  const fetchData = async () => {
    // Start loading
    loadingCoordinator.setLoading(LOADING_KEYS.FETCH_APPOINTMENTS, true);
    
    try {
      const response = await fetch('/api/appointments');
      const data = await response.json();
      return data;
    } finally {
      // Stop loading
      loadingCoordinator.setLoading(LOADING_KEYS.FETCH_APPOINTMENTS, false);
    }
  };
  
  // Check if loading
  const isLoading = loadingCoordinator.isLoading(LOADING_KEYS.FETCH_APPOINTMENTS);
  
  return { fetchData, isLoading };
};

/**
 * Example 2: Using withLoading Helper
 */
export const WithLoadingExample = () => {
  const loadingCoordinator = useLoadingCoordinator();
  
  const fetchData = async () => {
    // Automatically manages loading state
    return loadingCoordinator.withLoading(
      LOADING_KEYS.FETCH_APPOINTMENTS,
      async () => {
        const response = await fetch('/api/appointments');
        return response.json();
      }
    );
  };
  
  const isLoading = loadingCoordinator.isLoading(LOADING_KEYS.FETCH_APPOINTMENTS);
  
  return { fetchData, isLoading };
};

/**
 * Example 3: Custom Debounce Configuration
 */
export const CustomDebounceExample = () => {
  // Use fast preset for quick operations
  const loadingCoordinator = useLoadingCoordinator(DEBOUNCE_PRESETS.FAST);
  
  const quickOperation = async () => {
    return loadingCoordinator.withLoading(
      'quick-op',
      async () => {
        // Fast operation that completes quickly
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'done';
      }
    );
  };
  
  return { quickOperation };
};

/**
 * Example 4: Scoped Loading Keys for Multiple Items
 */
export const ScopedLoadingExample = () => {
  const loadingCoordinator = useLoadingCoordinator();
  
  const cancelAppointment = async (appointmentId) => {
    const loadingKey = appointmentLoadingKey('cancel', appointmentId);
    
    return loadingCoordinator.withLoading(
      loadingKey,
      async () => {
        const response = await fetch(`/api/appointments/${appointmentId}`, {
          method: 'DELETE'
        });
        return response.json();
      }
    );
  };
  
  const isAppointmentCancelling = (appointmentId) => {
    const loadingKey = appointmentLoadingKey('cancel', appointmentId);
    return loadingCoordinator.isLoading(loadingKey);
  };
  
  return { cancelAppointment, isAppointmentCancelling };
};

/**
 * Example 5: Loading State Deduplication
 */
export const DeduplicationExample = () => {
  const loadingCoordinator = useLoadingCoordinator();
  
  const fetchAppointments = async () => {
    // Multiple components can call this simultaneously
    // Loading state is deduplicated automatically
    return loadingCoordinator.withLoading(
      LOADING_KEYS.FETCH_APPOINTMENTS,
      async () => {
        const response = await fetch('/api/appointments');
        return response.json();
      }
    );
  };
  
  // Even if called multiple times, only one loading indicator shows
  const loadMultipleTimes = async () => {
    await Promise.all([
      fetchAppointments(),
      fetchAppointments(),
      fetchAppointments()
    ]);
  };
  
  return { fetchAppointments, loadMultipleTimes };
};

/**
 * Example 6: Global Loading State
 */
export const GlobalLoadingExample = () => {
  const loadingCoordinator = useLoadingCoordinator();
  
  const operation1 = async () => {
    return loadingCoordinator.withLoading('op1', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
  };
  
  const operation2 = async () => {
    return loadingCoordinator.withLoading('op2', async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
  };
  
  // Check if ANY operation is loading
  const isAnyLoading = loadingCoordinator.isLoading();
  
  // Get all loading operations
  const loadingOps = loadingCoordinator.getLoadingOperations();
  
  return { operation1, operation2, isAnyLoading, loadingOps };
};

/**
 * Example 7: Loading Statistics and Monitoring
 */
export const LoadingStatsExample = () => {
  const loadingCoordinator = useLoadingCoordinator();
  
  const performOperation = async () => {
    return loadingCoordinator.withLoading(
      'monitored-op',
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return 'completed';
      }
    );
  };
  
  const getStats = () => {
    const stats = loadingCoordinator.getStats();
    console.log('Loading Statistics:', {
      total: stats.totalOperations,
      active: stats.activeOperations,
      completed: stats.completedOperations,
      debounced: stats.debouncedOperations
    });
    return stats;
  };
  
  const getOperationDetails = (key) => {
    const details = loadingCoordinator.getLoadingDetails(key);
    if (details) {
      console.log(`Operation "${key}":`, {
        active: details.active,
        visible: details.visible,
        duration: formatLoadingDuration(details.duration),
        requests: details.requestCount
      });
    }
    return details;
  };
  
  return { performOperation, getStats, getOperationDetails };
};

/**
 * Example 8: Coordinated Loading with Multiple Operations
 */
export const CoordinatedLoadingExample = () => {
  const loadingCoordinator = useLoadingCoordinator();
  
  const loadDashboard = async () => {
    // Start multiple operations
    const appointmentsPromise = loadingCoordinator.withLoading(
      LOADING_KEYS.FETCH_APPOINTMENTS,
      async () => {
        const response = await fetch('/api/appointments');
        return response.json();
      }
    );
    
    const profilePromise = loadingCoordinator.withLoading(
      LOADING_KEYS.FETCH_PROFILE,
      async () => {
        const response = await fetch('/api/profile');
        return response.json();
      }
    );
    
    // Wait for all operations
    const [appointments, profile] = await Promise.all([
      appointmentsPromise,
      profilePromise
    ]);
    
    return { appointments, profile };
  };
  
  // Check specific loading states
  const isAppointmentsLoading = loadingCoordinator.isLoading(LOADING_KEYS.FETCH_APPOINTMENTS);
  const isProfileLoading = loadingCoordinator.isLoading(LOADING_KEYS.FETCH_PROFILE);
  
  // Check if any dashboard operation is loading
  const isDashboardLoading = isAppointmentsLoading || isProfileLoading;
  
  return { loadDashboard, isAppointmentsLoading, isProfileLoading, isDashboardLoading };
};

/**
 * Example 9: Custom Configuration for Different Operation Types
 */
export const CustomConfigExample = () => {
  // Critical operations - always show loading immediately
  const criticalConfig = createLoadingConfig('CRITICAL');
  const criticalLoader = useLoadingCoordinator(criticalConfig);
  
  // Fast operations - minimal debounce
  const fastConfig = createLoadingConfig('FAST');
  const fastLoader = useLoadingCoordinator(fastConfig);
  
  const criticalOperation = async () => {
    return criticalLoader.withLoading('critical', async () => {
      // Important operation that user must wait for
      await new Promise(resolve => setTimeout(resolve, 2000));
    });
  };
  
  const fastOperation = async () => {
    return fastLoader.withLoading('fast', async () => {
      // Quick operation that might complete before debounce
      await new Promise(resolve => setTimeout(resolve, 50));
    });
  };
  
  return { criticalOperation, fastOperation };
};

/**
 * Example 10: Cleanup and Management
 */
export const CleanupExample = () => {
  const loadingCoordinator = useLoadingCoordinator();
  
  const startOperation = async (key) => {
    return loadingCoordinator.withLoading(key, async () => {
      await new Promise(resolve => setTimeout(resolve, 5000));
    });
  };
  
  // Clear specific loading state
  const cancelOperation = (key) => {
    loadingCoordinator.clearLoading(key);
  };
  
  // Clear all loading states
  const cancelAllOperations = () => {
    loadingCoordinator.clearAll();
  };
  
  // Get all active operations
  const getActiveOperations = () => {
    return loadingCoordinator.getActiveOperations();
  };
  
  return {
    startOperation,
    cancelOperation,
    cancelAllOperations,
    getActiveOperations
  };
};

export default {
  BasicLoadingExample,
  WithLoadingExample,
  CustomDebounceExample,
  ScopedLoadingExample,
  DeduplicationExample,
  GlobalLoadingExample,
  LoadingStatsExample,
  CoordinatedLoadingExample,
  CustomConfigExample,
  CleanupExample
};
