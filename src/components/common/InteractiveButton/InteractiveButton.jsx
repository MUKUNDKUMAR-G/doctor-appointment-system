import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import './InteractiveButton.css';

/**
 * InteractiveButton Component
 * Button with micro-interactions including hover, click, and ripple effects
 */
const InteractiveButton = ({
  children,
  onClick,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const [ripples, setRipples] = useState([]);
  const prefersReducedMotion = useReducedMotion();

  const handleClick = (e) => {
    if (disabled || loading) return;

    // Create ripple effect
    if (!prefersReducedMotion) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const newRipple = {
        x,
        y,
        size,
        id: Date.now(),
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    }

    if (onClick) {
      onClick(e);
    }
  };

  const buttonClasses = [
    'interactive-button',
    `interactive-button--${variant}`,
    `interactive-button--${size}`,
    disabled && 'interactive-button--disabled',
    loading && 'interactive-button--loading',
    fullWidth && 'interactive-button--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: prefersReducedMotion ? 1 : 1.02 },
    tap: { scale: prefersReducedMotion ? 1 : 0.98 },
  };

  return (
    <motion.button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      transition={{ duration: 0.2 }}
      {...props}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="interactive-button__ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}

      {/* Button content */}
      <span className="interactive-button__content">
        {loading && (
          <span className="interactive-button__spinner">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        {icon && iconPosition === 'left' && !loading && (
          <span className="interactive-button__icon interactive-button__icon--left">
            {icon}
          </span>
        )}
        <span className="interactive-button__text">{children}</span>
        {icon && iconPosition === 'right' && !loading && (
          <span className="interactive-button__icon interactive-button__icon--right">
            {icon}
          </span>
        )}
      </span>
    </motion.button>
  );
};

export default InteractiveButton;
