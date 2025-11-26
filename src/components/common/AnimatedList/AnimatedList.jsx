import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import {
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  staggerItem,
  staggerItemFade,
  staggerItemScale,
  staggerItemSlideLeft,
  getAccessibleVariants,
} from '../../../theme/animations';

/**
 * AnimatedList Component
 * Renders a list with staggered animations for children
 */
const AnimatedList = ({
  children,
  speed = 'normal', // 'fast', 'normal', 'slow'
  itemVariant = 'default', // 'default', 'fade', 'scale', 'slideLeft'
  className = '',
  itemClassName = '',
  as = 'div',
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Select container variant based on speed
  const containerVariants = {
    fast: staggerContainerFast,
    normal: staggerContainer,
    slow: staggerContainerSlow,
  }[speed] || staggerContainer;

  // Select item variant based on type
  const itemVariants = {
    default: staggerItem,
    fade: staggerItemFade,
    scale: staggerItemScale,
    slideLeft: staggerItemSlideLeft,
  }[itemVariant] || staggerItem;

  // Get accessible variants
  const accessibleContainerVariants = getAccessibleVariants(
    containerVariants,
    prefersReducedMotion
  );
  const accessibleItemVariants = getAccessibleVariants(
    itemVariants,
    prefersReducedMotion
  );

  const Container = motion[as] || motion.div;

  return (
    <Container
      variants={accessibleContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={accessibleItemVariants}
          className={itemClassName}
        >
          {child}
        </motion.div>
      ))}
    </Container>
  );
};

export default AnimatedList;
