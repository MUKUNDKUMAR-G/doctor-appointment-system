// Animation configurations for the Healthcare Appointment System
export const animations = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    // Framer Motion expects arrays for cubic-bezier
    easeInOut: [0.4, 0, 0.2, 1],
    easeOut: [0, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
    sharp: [0.4, 0, 0.6, 1],
    spring: { type: 'spring', stiffness: 300, damping: 30 },
  },
};

// ============================================
// FADE ANIMATIONS
// ============================================

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export const fadeInFast = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
};

export const fadeInSlow = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 },
};

// ============================================
// SLIDE ANIMATIONS
// ============================================

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export const slideDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export const slideLeft = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export const slideRight = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export const slideUpLarge = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -60 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
};

// ============================================
// SCALE ANIMATIONS
// ============================================

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export const scaleInSmall = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
};

export const scaleInLarge = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
};

export const scaleInSpring = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { type: 'spring', stiffness: 300, damping: 25 },
};

export const popIn = {
  initial: { opacity: 0, scale: 0 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0 },
  transition: { type: 'spring', stiffness: 400, damping: 20 },
};

// ============================================
// STAGGER ANIMATIONS FOR LISTS
// ============================================

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerFast = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerSlow = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.08,
      staggerDirection: -1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export const staggerItemFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export const staggerItemScale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export const staggerItemSlideLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

// ============================================
// LOADING ANIMATIONS
// ============================================

export const pulse = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const spin = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const bounce = {
  initial: { y: 0 },
  animate: {
    y: [-10, 0, -10],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const shimmer = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const fadeInOut = {
  initial: { opacity: 0.3 },
  animate: {
    opacity: [0.3, 1, 0.3],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const skeletonPulse = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ============================================
// COMBINED ANIMATIONS
// ============================================

export const slideAndFade = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export const scaleAndFade = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export const slideRotate = {
  initial: { opacity: 0, y: 20, rotate: -5 },
  animate: { opacity: 1, y: 0, rotate: 0 },
  exit: { opacity: 0, y: -20, rotate: 5 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get animation variants with reduced motion support
 * @param {object} variants - Animation variants
 * @param {boolean} prefersReducedMotion - Whether user prefers reduced motion
 * @returns {object} Modified variants
 */
export const getAccessibleVariants = (variants, prefersReducedMotion) => {
  if (prefersReducedMotion) {
    const staticState = variants.animate || variants.initial || {};
    return {
      initial: staticState,
      animate: staticState,
      exit: staticState,
      transition: { duration: 0 },
    };
  }
  return variants;
};

/**
 * Get transition with reduced motion support
 * @param {object} transition - Transition configuration
 * @param {boolean} prefersReducedMotion - Whether user prefers reduced motion
 * @returns {object} Modified transition
 */
export const getAccessibleTransition = (transition, prefersReducedMotion) => {
  if (prefersReducedMotion) {
    return { duration: 0 };
  }
  return transition;
};

/**
 * Create custom stagger container with configurable delay
 * @param {number} staggerDelay - Delay between children animations in seconds
 * @param {number} delayChildren - Initial delay before children start animating
 * @returns {object} Stagger container variants
 */
export const createStaggerContainer = (staggerDelay = 0.1, delayChildren = 0.05) => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
  exit: {
    transition: {
      staggerChildren: staggerDelay / 2,
      staggerDirection: -1,
    },
  },
});

/**
 * Create custom slide animation with configurable distance
 * @param {string} direction - Direction of slide: 'up', 'down', 'left', 'right'
 * @param {number} distance - Distance to slide in pixels
 * @param {number} duration - Animation duration in seconds
 * @returns {object} Slide animation variants
 */
export const createSlideAnimation = (direction = 'up', distance = 20, duration = 0.3) => {
  const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
  const initialValue = direction === 'up' || direction === 'left' ? distance : -distance;
  const exitValue = direction === 'up' || direction === 'left' ? -distance : distance;

  return {
    initial: { opacity: 0, [axis]: initialValue },
    animate: { opacity: 1, [axis]: 0 },
    exit: { opacity: 0, [axis]: exitValue },
    transition: { duration, ease: [0.4, 0, 0.2, 1] },
  };
};

/**
 * Create custom scale animation with configurable scale factor
 * @param {number} scaleFactor - Initial scale factor (0-1)
 * @param {number} duration - Animation duration in seconds
 * @param {boolean} useSpring - Whether to use spring animation
 * @returns {object} Scale animation variants
 */
export const createScaleAnimation = (scaleFactor = 0.9, duration = 0.3, useSpring = false) => {
  const transition = useSpring
    ? { type: 'spring', stiffness: 300, damping: 25 }
    : { duration, ease: [0.4, 0, 0.2, 1] };

  return {
    initial: { opacity: 0, scale: scaleFactor },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: scaleFactor },
    transition,
  };
};

/**
 * Combine multiple animation variants
 * @param {...object} variants - Animation variants to combine
 * @returns {object} Combined animation variants
 */
export const combineVariants = (...variants) => {
  return variants.reduce((acc, variant) => {
    return {
      initial: { ...acc.initial, ...variant.initial },
      animate: { ...acc.animate, ...variant.animate },
      exit: { ...acc.exit, ...variant.exit },
      transition: variant.transition || acc.transition,
    };
  }, { initial: {}, animate: {}, exit: {} });
};
