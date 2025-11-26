import { useState, useEffect } from 'react';

/**
 * Custom hook to detect user's motion preference
 * Returns true if user prefers reduced motion
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if matchMedia is supported
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
};

/**
 * Get animation configuration based on motion preference
 * @param {object} animation - Animation configuration
 * @param {boolean} prefersReducedMotion - Motion preference
 * @returns {object} Modified animation configuration
 */
export const getAccessibleAnimation = (animation, prefersReducedMotion) => {
  if (prefersReducedMotion) {
    return {
      ...animation,
      transition: { duration: 0 },
      animate: animation.initial || {},
    };
  }
  return animation;
};

/**
 * Get duration based on motion preference
 * @param {number} duration - Default duration in ms
 * @param {boolean} prefersReducedMotion - Motion preference
 * @returns {number} Duration (0 if reduced motion preferred)
 */
export const getAccessibleDuration = (duration, prefersReducedMotion) => {
  return prefersReducedMotion ? 0 : duration;
};
