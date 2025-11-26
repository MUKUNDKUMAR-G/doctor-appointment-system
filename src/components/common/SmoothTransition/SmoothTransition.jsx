import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import {
  fadeIn,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scaleIn,
  getAccessibleVariants,
} from '../../../theme/animations';

/**
 * SmoothTransition Component
 * Wraps content with smooth enter/exit transitions
 */
const SmoothTransition = ({
  children,
  show = true,
  mode = 'wait', // 'wait', 'sync', 'popLayout'
  animation = 'fade', // 'fade', 'slideUp', 'slideDown', 'slideLeft', 'slideRight', 'scale'
  duration = 0.3,
  delay = 0,
  className = '',
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Select animation variant
  const animationVariants = {
    fade: fadeIn,
    slideUp,
    slideDown,
    slideLeft,
    slideRight,
    scale: scaleIn,
  }[animation] || fadeIn;

  // Get accessible variants
  const variants = getAccessibleVariants(animationVariants, prefersReducedMotion);

  // Customize transition
  const transition = {
    duration: prefersReducedMotion ? 0 : duration,
    delay: prefersReducedMotion ? 0 : delay,
    ease: [0.4, 0, 0.2, 1],
  };

  return (
    <AnimatePresence mode={mode}>
      {show && (
        <motion.div
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className={className}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmoothTransition;
