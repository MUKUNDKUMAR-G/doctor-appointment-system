/**
 * Animation Helper Utilities
 * Provides utility functions for working with animations in the Healthcare Appointment System
 */

/**
 * Generate CSS keyframes for custom animations
 * @param {string} name - Animation name
 * @param {object} keyframes - Keyframe definitions
 * @returns {string} CSS keyframes string
 */
export const generateKeyframes = (name, keyframes) => {
  const keyframeString = Object.entries(keyframes)
    .map(([key, value]) => {
      const properties = Object.entries(value)
        .map(([prop, val]) => `${prop}: ${val};`)
        .join(' ');
      return `${key} { ${properties} }`;
    })
    .join(' ');

  return `@keyframes ${name} { ${keyframeString} }`;
};

/**
 * Create a delay for sequential animations
 * @param {number} index - Item index in list
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {number} Calculated delay
 */
export const calculateStaggerDelay = (index, baseDelay = 50) => {
  return index * baseDelay;
};

/**
 * Get animation duration based on distance
 * @param {number} distance - Distance to animate in pixels
 * @param {number} speed - Speed in pixels per millisecond
 * @returns {number} Duration in milliseconds
 */
export const calculateDurationByDistance = (distance, speed = 0.5) => {
  return Math.max(200, Math.min(500, distance / speed));
};

/**
 * Create easing function string for CSS
 * @param {string} type - Easing type: 'ease-in', 'ease-out', 'ease-in-out', 'linear'
 * @returns {string} CSS easing function
 */
export const getEasingFunction = (type = 'ease-in-out') => {
  const easings = {
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
    'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
    'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'linear': 'linear',
    'sharp': 'cubic-bezier(0.4, 0, 0.6, 1)',
    'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  };
  return easings[type] || easings['ease-in-out'];
};

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @param {number} threshold - Percentage of element that should be visible (0-1)
 * @returns {boolean} Whether element is in viewport
 */
export const isInViewport = (element, threshold = 0.1) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height * threshold) >= 0);
  const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width * threshold) >= 0);
  
  return vertInView && horInView;
};

/**
 * Create intersection observer for scroll animations
 * @param {Function} callback - Callback function when element intersects
 * @param {object} options - Intersection observer options
 * @returns {IntersectionObserver} Intersection observer instance
 */
export const createScrollObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

/**
 * Animate element on scroll into view
 * @param {HTMLElement} element - Element to animate
 * @param {string} animationClass - CSS class to add
 * @param {object} options - Observer options
 */
export const animateOnScroll = (element, animationClass, options = {}) => {
  if (!element) return;

  const observer = createScrollObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add(animationClass);
        if (options.once !== false) {
          observer.unobserve(entry.target);
        }
      } else if (options.once === false) {
        entry.target.classList.remove(animationClass);
      }
    });
  }, options);

  observer.observe(element);
  return observer;
};

/**
 * Create spring animation configuration
 * @param {number} stiffness - Spring stiffness (default: 300)
 * @param {number} damping - Spring damping (default: 30)
 * @param {number} mass - Spring mass (default: 1)
 * @returns {object} Spring configuration
 */
export const createSpringConfig = (stiffness = 300, damping = 30, mass = 1) => ({
  type: 'spring',
  stiffness,
  damping,
  mass,
});

/**
 * Presets for common spring animations
 */
export const springPresets = {
  gentle: createSpringConfig(120, 14, 1),
  wobbly: createSpringConfig(180, 12, 1),
  stiff: createSpringConfig(400, 30, 1),
  slow: createSpringConfig(280, 60, 1),
  molasses: createSpringConfig(280, 120, 1),
};

/**
 * Get random delay for staggered animations
 * @param {number} min - Minimum delay in milliseconds
 * @param {number} max - Maximum delay in milliseconds
 * @returns {number} Random delay
 */
export const getRandomDelay = (min = 0, max = 200) => {
  return Math.random() * (max - min) + min;
};

/**
 * Create wave animation delays for grid items
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {number} Calculated delay
 */
export const calculateWaveDelay = (row, col, baseDelay = 50) => {
  return (row + col) * baseDelay;
};

/**
 * Create spiral animation delays for grid items
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number} centerRow - Center row index
 * @param {number} centerCol - Center column index
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {number} Calculated delay
 */
export const calculateSpiralDelay = (row, col, centerRow, centerCol, baseDelay = 50) => {
  const distance = Math.sqrt(
    Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
  );
  return distance * baseDelay;
};

/**
 * Debounce animation triggers
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounceAnimation = (func, wait = 100) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle animation triggers
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttleAnimation = (func, limit = 100) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Request animation frame with fallback
 * @param {Function} callback - Callback function
 * @returns {number} Request ID
 */
export const requestAnimationFramePolyfill = (callback) => {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      return window.setTimeout(callback, 1000 / 60);
    }
  )(callback);
};

/**
 * Cancel animation frame with fallback
 * @param {number} id - Request ID
 */
export const cancelAnimationFramePolyfill = (id) => {
  (
    window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    function (id) {
      window.clearTimeout(id);
    }
  )(id);
};

export default {
  generateKeyframes,
  calculateStaggerDelay,
  calculateDurationByDistance,
  getEasingFunction,
  isInViewport,
  createScrollObserver,
  animateOnScroll,
  createSpringConfig,
  springPresets,
  getRandomDelay,
  calculateWaveDelay,
  calculateSpiralDelay,
  debounceAnimation,
  throttleAnimation,
  requestAnimationFramePolyfill,
  cancelAnimationFramePolyfill,
};
