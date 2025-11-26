/**
 * Loading Coordinator Helper Utilities
 * 
 * Provides utility functions and constants for working with the loading coordinator.
 */

/**
 * Common loading operation keys
 */
export const LOADING_KEYS = {
  // Appointment operations
  FETCH_APPOINTMENTS: 'fetch-appointments',
  CREATE_APPOINTMENT: 'create-appointment',
  UPDATE_APPOINTMENT: 'update-appointment',
  CANCEL_APPOINTMENT: 'cancel-appointment',
  RESCHEDULE_APPOINTMENT: 'reschedule-appointment',
  
  // User operations
  FETCH_PROFILE: 'fetch-profile',
  UPDATE_PROFILE: 'update-profile',
  
  // Authentication operations
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  
  // Real-time sync
  SYNC_DATA: 'sync-data',
  
  // General operations
  INITIAL_LOAD: 'initial-load',
  REFRESH: 'refresh',
  SAVE: 'save',
  DELETE: 'delete'
};

/**
 * Generate a scoped loading key
 * Useful for creating unique keys for similar operations on different entities
 * 
 * @param {string} operation - The operation type
 * @param {string|number} id - The entity ID
 * @returns {string} Scoped loading key
 */
export const scopedLoadingKey = (operation, id) => {
  return `${operation}:${id}`;
};

/**
 * Generate a composite loading key for operations that depend on multiple entities
 * 
 * @param {string[]} parts - Array of key parts
 * @returns {string} Composite loading key
 */
export const compositeLoadingKey = (...parts) => {
  return parts.filter(Boolean).join(':');
};

/**
 * Check if a loading key matches a pattern
 * 
 * @param {string} key - The loading key to check
 * @param {string|RegExp} pattern - Pattern to match against
 * @returns {boolean} Whether the key matches the pattern
 */
export const matchesLoadingKey = (key, pattern) => {
  if (typeof pattern === 'string') {
    return key.includes(pattern);
  } else if (pattern instanceof RegExp) {
    return pattern.test(key);
  }
  return false;
};

/**
 * Create a loading key for appointment operations
 * 
 * @param {string} operation - The operation type (fetch, create, update, etc.)
 * @param {string|number} [appointmentId] - Optional appointment ID
 * @returns {string} Appointment loading key
 */
export const appointmentLoadingKey = (operation, appointmentId) => {
  if (appointmentId) {
    return scopedLoadingKey(`appointment-${operation}`, appointmentId);
  }
  return `appointments-${operation}`;
};

/**
 * Create a loading key for user operations
 * 
 * @param {string} operation - The operation type
 * @param {string|number} [userId] - Optional user ID
 * @returns {string} User loading key
 */
export const userLoadingKey = (operation, userId) => {
  if (userId) {
    return scopedLoadingKey(`user-${operation}`, userId);
  }
  return `user-${operation}`;
};

/**
 * Debounce configuration presets
 */
export const DEBOUNCE_PRESETS = {
  // No debounce - show loading immediately
  IMMEDIATE: {
    debounceDelay: 0,
    minLoadingDuration: 0,
    enableDebounce: false,
    enableMinDuration: false
  },
  
  // Fast operations - minimal debounce
  FAST: {
    debounceDelay: 100,
    minLoadingDuration: 200,
    enableDebounce: true,
    enableMinDuration: true
  },
  
  // Normal operations - balanced debounce
  NORMAL: {
    debounceDelay: 200,
    minLoadingDuration: 300,
    enableDebounce: true,
    enableMinDuration: true
  },
  
  // Slow operations - longer debounce
  SLOW: {
    debounceDelay: 300,
    minLoadingDuration: 500,
    enableDebounce: true,
    enableMinDuration: true
  },
  
  // Critical operations - always show loading
  CRITICAL: {
    debounceDelay: 0,
    minLoadingDuration: 500,
    enableDebounce: false,
    enableMinDuration: true
  }
};

/**
 * Create a loading coordinator configuration
 * 
 * @param {string} preset - Preset name from DEBOUNCE_PRESETS
 * @param {object} overrides - Optional configuration overrides
 * @returns {object} Loading coordinator configuration
 */
export const createLoadingConfig = (preset = 'NORMAL', overrides = {}) => {
  const presetConfig = DEBOUNCE_PRESETS[preset] || DEBOUNCE_PRESETS.NORMAL;
  return { ...presetConfig, ...overrides };
};

/**
 * Format loading duration for display
 * 
 * @param {number} duration - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export const formatLoadingDuration = (duration) => {
  if (duration < 1000) {
    return `${duration}ms`;
  } else if (duration < 60000) {
    return `${(duration / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
};

/**
 * Check if loading duration exceeds threshold
 * 
 * @param {number} duration - Duration in milliseconds
 * @param {number} threshold - Threshold in milliseconds
 * @returns {boolean} Whether duration exceeds threshold
 */
export const isLoadingTooLong = (duration, threshold = 5000) => {
  return duration > threshold;
};

/**
 * Get loading priority based on operation type
 * 
 * @param {string} operation - The operation type
 * @returns {string} Priority level (high, normal, low)
 */
export const getLoadingPriority = (operation) => {
  const highPriorityOps = [
    LOADING_KEYS.LOGIN,
    LOADING_KEYS.LOGOUT,
    LOADING_KEYS.INITIAL_LOAD,
    LOADING_KEYS.FETCH_APPOINTMENTS
  ];
  
  const lowPriorityOps = [
    LOADING_KEYS.SYNC_DATA
  ];
  
  if (highPriorityOps.includes(operation)) {
    return 'high';
  } else if (lowPriorityOps.includes(operation)) {
    return 'low';
  }
  
  return 'normal';
};

export default {
  LOADING_KEYS,
  DEBOUNCE_PRESETS,
  scopedLoadingKey,
  compositeLoadingKey,
  matchesLoadingKey,
  appointmentLoadingKey,
  userLoadingKey,
  createLoadingConfig,
  formatLoadingDuration,
  isLoadingTooLong,
  getLoadingPriority
};
