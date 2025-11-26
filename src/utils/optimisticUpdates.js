/**
 * Utility functions for implementing optimistic UI updates
 */

/**
 * Creates an optimistic update handler
 * @param {Function} updateFn - Function to update local state optimistically
 * @param {Function} apiFn - API call function
 * @param {Function} rollbackFn - Function to rollback on error
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const createOptimisticUpdate = ({
  updateFn,
  apiFn,
  rollbackFn,
  onSuccess,
  onError,
}) => {
  return async (...args) => {
    // Store original state for potential rollback
    const originalState = updateFn ? updateFn(...args) : null;

    try {
      // Execute API call
      const result = await apiFn(...args);

      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      // Rollback on error
      if (rollbackFn && originalState !== null) {
        rollbackFn(originalState);
      }

      // Call error callback
      if (onError) {
        onError(error);
      }

      throw error;
    }
  };
};

/**
 * Hook for managing optimistic updates with state
 * @param {any} initialState - Initial state value
 */
export const useOptimisticState = (initialState) => {
  const [state, setState] = useState(initialState);
  const [optimisticState, setOptimisticState] = useState(null);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const applyOptimisticUpdate = (newState) => {
    setOptimisticState(state); // Store current state for rollback
    setState(newState);
    setIsOptimistic(true);
  };

  const confirmUpdate = (confirmedState) => {
    setState(confirmedState || state);
    setOptimisticState(null);
    setIsOptimistic(false);
  };

  const rollbackUpdate = () => {
    if (optimisticState !== null) {
      setState(optimisticState);
    }
    setOptimisticState(null);
    setIsOptimistic(false);
  };

  return {
    state,
    setState,
    isOptimistic,
    applyOptimisticUpdate,
    confirmUpdate,
    rollbackUpdate,
  };
};

/**
 * Smooth state transition utility
 * @param {Function} setState - State setter function
 * @param {any} newState - New state value
 * @param {number} delay - Transition delay in ms
 */
export const smoothStateTransition = (setState, newState, delay = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      setState(newState);
      resolve();
    }, delay);
  });
};

/**
 * Batch state updates for better performance
 * @param {Array} updates - Array of update functions
 */
export const batchStateUpdates = (updates) => {
  // React 18 automatically batches updates, but this can be used
  // for explicit batching in older versions or complex scenarios
  updates.forEach((update) => update());
};

/**
 * Create a loading state manager with smooth transitions
 */
export class LoadingStateManager {
  constructor() {
    this.loadingStates = new Map();
    this.listeners = new Set();
  }

  setLoading(key, isLoading) {
    this.loadingStates.set(key, isLoading);
    this.notifyListeners();
  }

  isLoading(key) {
    return this.loadingStates.get(key) || false;
  }

  isAnyLoading() {
    return Array.from(this.loadingStates.values()).some((loading) => loading);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.loadingStates));
  }

  clear() {
    this.loadingStates.clear();
    this.notifyListeners();
  }
}

export default {
  createOptimisticUpdate,
  useOptimisticState,
  smoothStateTransition,
  batchStateUpdates,
  LoadingStateManager,
};
