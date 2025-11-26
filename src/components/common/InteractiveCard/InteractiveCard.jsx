import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useHoverAnimation } from '../../../hooks/useScrollAnimation';
import './InteractiveCard.css';

/**
 * InteractiveCard Component
 * Card with hover lift effect, glow, and smooth transitions
 */
const InteractiveCard = ({
  children,
  onClick,
  variant = 'default', // 'default', 'glass', 'elevated', 'outlined'
  hoverEffect = 'lift', // 'lift', 'glow', 'scale', 'none'
  padding = 'medium', // 'small', 'medium', 'large'
  className = '',
  style = {},
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();
  const { isHovered, hoverProps } = useHoverAnimation();

  const cardClasses = [
    'interactive-card',
    `interactive-card--${variant}`,
    `interactive-card--padding-${padding}`,
    `interactive-card--hover-${hoverEffect}`,
    onClick && 'interactive-card--clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const cardVariants = {
    initial: {
      scale: 1,
      y: 0,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    hover: prefersReducedMotion
      ? {}
      : {
          scale: hoverEffect === 'scale' ? 1.02 : 1,
          y: hoverEffect === 'lift' ? -4 : 0,
          boxShadow:
            hoverEffect === 'glow'
              ? '0 0 20px rgba(99, 102, 241, 0.4)'
              : '0 8px 16px rgba(0, 0, 0, 0.15)',
        },
    tap: prefersReducedMotion
      ? {}
      : {
          scale: 0.98,
        },
  };

  return (
    <motion.div
      className={cardClasses}
      onClick={onClick}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap={onClick ? 'tap' : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={style}
      {...hoverProps}
      {...props}
    >
      {/* Glow effect overlay */}
      {hoverEffect === 'glow' && isHovered && !prefersReducedMotion && (
        <motion.div
          className="interactive-card__glow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Card content */}
      <div className="interactive-card__content">{children}</div>
    </motion.div>
  );
};

export default InteractiveCard;
