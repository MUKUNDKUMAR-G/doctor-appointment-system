/**
 * Performance optimization utilities
 */

/**
 * Deep comparison function for React.memo
 * Use this for props that contain objects or arrays
 */
export const deepEqual = (prevProps, nextProps) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};

/**
 * Shallow comparison function for React.memo
 * Use this for props that are primitives or simple objects
 */
export const shallowEqual = (prevProps, nextProps) => {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (let key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
};

/**
 * Create a memoized selector for expensive computations
 * Similar to reselect but simpler
 */
export const createMemoizedSelector = (selector) => {
  let lastArgs = null;
  let lastResult = null;

  return (...args) => {
    if (lastArgs && args.every((arg, i) => arg === lastArgs[i])) {
      return lastResult;
    }

    lastArgs = args;
    lastResult = selector(...args);
    return lastResult;
  };
};

/**
 * Throttle function for scroll and resize handlers
 */
export const throttle = (func, delay = 100) => {
  let timeoutId = null;
  let lastRan = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastRan >= delay) {
      func.apply(this, args);
      lastRan = now;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastRan = Date.now();
      }, delay - (now - lastRan));
    }
  };
};

/**
 * Debounce function for input handlers
 */
export const debounce = (func, delay = 300) => {
  let timeoutId = null;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

/**
 * Check if component should update based on specific props
 */
export const shouldUpdateForProps = (propNames) => (prevProps, nextProps) => {
  return propNames.every(propName => prevProps[propName] === nextProps[propName]);
};

/**
 * Batch state updates to reduce re-renders
 */
export const batchUpdates = (callback) => {
  // React 18+ automatically batches updates
  // This is a placeholder for potential future optimizations
  callback();
};

/**
 * Measure component render time (development only)
 */
export const measureRenderTime = (componentName, callback) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    const result = callback();
    const end = performance.now();
    console.log(`[Performance] ${componentName} rendered in ${(end - start).toFixed(2)}ms`);
    return result;
  }
  return callback();
};

/**
 * Create a stable callback reference that doesn't change between renders
 * unless dependencies change
 */
export const useStableCallback = (callback, deps) => {
  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  return React.useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
};
