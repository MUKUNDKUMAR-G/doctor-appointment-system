import { useEffect, useRef, useState } from 'react';
import { createScrollObserver } from '../utils/animationHelpers';

/**
 * Hook for animating elements on scroll into view
 * @param {object} options - Configuration options
 * @param {number} options.threshold - Intersection threshold (0-1)
 * @param {string} options.rootMargin - Root margin for intersection observer
 * @param {boolean} options.triggerOnce - Whether to trigger animation only once
 * @returns {object} Ref and visibility state
 */
export const useScrollAnimation = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
  } = options;

  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    observerRef.current = createScrollObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce && observerRef.current) {
              observerRef.current.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref: elementRef, isVisible };
};

/**
 * Hook for staggered list animations
 * @param {number} itemCount - Number of items in list
 * @param {number} baseDelay - Base delay between items in milliseconds
 * @returns {Function} Function to get delay for item at index
 */
export const useStaggerAnimation = (itemCount, baseDelay = 50) => {
  const getDelay = (index) => {
    return index * baseDelay;
  };

  return getDelay;
};

/**
 * Hook for managing animation state
 * @param {boolean} initialState - Initial animation state
 * @returns {object} Animation state and controls
 */
export const useAnimationState = (initialState = false) => {
  const [isAnimating, setIsAnimating] = useState(initialState);
  const [hasAnimated, setHasAnimated] = useState(false);

  const startAnimation = () => {
    setIsAnimating(true);
    setHasAnimated(true);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setHasAnimated(false);
  };

  return {
    isAnimating,
    hasAnimated,
    startAnimation,
    stopAnimation,
    resetAnimation,
  };
};

/**
 * Hook for delayed animation trigger
 * @param {Function} callback - Callback to execute after delay
 * @param {number} delay - Delay in milliseconds
 * @param {Array} dependencies - Dependencies array
 */
export const useDelayedAnimation = (callback, delay, dependencies = []) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      callback();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, ...dependencies]);
};

/**
 * Hook for sequential animations
 * @param {Array} steps - Array of animation steps with delays
 * @returns {object} Current step and controls
 */
export const useSequentialAnimation = (steps = []) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutRef = useRef(null);

  const play = () => {
    setIsPlaying(true);
    setCurrentStep(0);
  };

  const pause = () => {
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length) {
      if (currentStep >= steps.length) {
        setIsPlaying(false);
      }
      return;
    }

    const currentStepData = steps[currentStep];
    const delay = currentStepData?.delay || 0;

    timeoutRef.current = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentStep, isPlaying, steps]);

  return {
    currentStep,
    isPlaying,
    play,
    pause,
    reset,
  };
};

/**
 * Hook for hover animation state
 * @returns {object} Hover state and handlers
 */
export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return {
    isHovered,
    handleMouseEnter,
    handleMouseLeave,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
};

/**
 * Hook for click animation state
 * @param {number} duration - Duration of click animation in milliseconds
 * @returns {object} Click state and handler
 */
export const useClickAnimation = (duration = 200) => {
  const [isClicked, setIsClicked] = useState(false);
  const timeoutRef = useRef(null);

  const handleClick = (callback) => {
    setIsClicked(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsClicked(false);
      if (callback) callback();
    }, duration);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isClicked,
    handleClick,
  };
};

export default {
  useScrollAnimation,
  useStaggerAnimation,
  useAnimationState,
  useDelayedAnimation,
  useSequentialAnimation,
  useHoverAnimation,
  useClickAnimation,
};
