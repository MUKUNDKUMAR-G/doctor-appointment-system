import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { getAccessibleVariants } from '../../../theme/animations';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

/**
 * AnimatedWrapper Component
 * Wraps children with animation variants and accessibility support
 */
const AnimatedWrapper = ({
  children,
  variants,
  initial = 'initial',
  animate = 'animate',
  exit = 'exit',
  transition,
  delay = 0,
  animateOnScroll = false,
  scrollOptions = {},
  className = '',
  style = {},
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();
  const { ref, isVisible } = useScrollAnimation(
    animateOnScroll ? scrollOptions : { threshold: 0 }
  );

  // Get accessible variants based on user preferences
  const accessibleVariants = getAccessibleVariants(variants, prefersReducedMotion);

  // Determine animation state
  const animationState = animateOnScroll
    ? isVisible
      ? animate
      : initial
    : animate;

  // Add delay to transition if specified
  const finalTransition = transition || variants?.transition || {};
  if (delay > 0 && !prefersReducedMotion) {
    finalTransition.delay = delay;
  }

  return (
    <motion.div
      ref={animateOnScroll ? ref : undefined}
      variants={accessibleVariants}
      initial={initial}
      animate={animationState}
      exit={exit}
      transition={finalTransition}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedWrapper;
