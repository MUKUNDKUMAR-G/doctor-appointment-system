import React, { createContext, useContext } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

const MotionContext = createContext({
  prefersReducedMotion: false,
  getAnimationProps: (props) => props,
  getDuration: (duration) => duration,
});

/**
 * Motion Context Provider
 * Provides motion preference information to all child components
 */
export const MotionProvider = ({ children }) => {
  const prefersReducedMotion = useReducedMotion();

  /**
   * Get animation props with reduced motion support
   * @param {object} props - Framer Motion animation props
   * @returns {object} Modified props based on motion preference
   */
  const getAnimationProps = (props) => {
    if (prefersReducedMotion) {
      return {
        ...props,
        initial: props.animate || props.initial || {},
        animate: props.animate || props.initial || {},
        exit: props.animate || props.initial || {},
        transition: { duration: 0 },
      };
    }
    return props;
  };

  /**
   * Get duration with reduced motion support
   * @param {number} duration - Duration in milliseconds
   * @returns {number} Duration (0 if reduced motion preferred)
   */
  const getDuration = (duration) => {
    return prefersReducedMotion ? 0 : duration;
  };

  const value = {
    prefersReducedMotion,
    getAnimationProps,
    getDuration,
  };

  return (
    <MotionContext.Provider value={value}>
      {children}
    </MotionContext.Provider>
  );
};

/**
 * Hook to access motion context
 */
export const useMotion = () => {
  const context = useContext(MotionContext);
  if (!context) {
    throw new Error('useMotion must be used within a MotionProvider');
  }
  return context;
};
