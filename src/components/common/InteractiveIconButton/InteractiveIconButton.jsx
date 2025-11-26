import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import './InteractiveIconButton.css';

/**
 * InteractiveIconButton Component
 * Icon button with hover and click micro-interactions
 */
const InteractiveIconButton = ({
  icon,
  onClick,
  variant = 'default', // 'default', 'primary', 'danger', 'ghost'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false,
  ariaLabel,
  tooltip,
  className = '',
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();

  const buttonClasses = [
    'interactive-icon-button',
    `interactive-icon-button--${variant}`,
    `interactive-icon-button--${size}`,
    disabled && 'interactive-icon-button--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const buttonVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: prefersReducedMotion
      ? {}
      : {
          scale: 1.1,
          rotate: 5,
        },
    tap: prefersReducedMotion
      ? {}
      : {
          scale: 0.9,
          rotate: -5,
        },
  };

  return (
    <motion.button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={tooltip}
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...props}
    >
      <span className="interactive-icon-button__icon">{icon}</span>
      {tooltip && <span className="interactive-icon-button__tooltip">{tooltip}</span>}
    </motion.button>
  );
};

export default InteractiveIconButton;
