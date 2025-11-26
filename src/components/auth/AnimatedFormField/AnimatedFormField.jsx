import React, { useCallback, useEffect, useRef } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { staggerItem } from '../../../theme/animations';

/**
 * @typedef {import('../types').AnimatedFormFieldProps} AnimatedFormFieldProps
 */

/**
 * AnimatedFormField component with animations and validation
 * @param {AnimatedFormFieldProps} props
 */
const AnimatedFormField = ({
  label,
  type,
  value,
  onChange,
  error,
  touched = false,
  icon,
  endAdornment,
  autoComplete,
  required = false,
  disabled = false,
  onFocus,
  onBlur,
  animationDelay = 0,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimation();
  const fieldRef = useRef(null);

  // Determine validation state
  const hasError = touched && !!error;
  // Value is valid if it's non-empty after trimming
  const hasValue = value && value.trim().length > 0;
  const isValid = touched && !error && hasValue;

  // Shake animation for errors
  const triggerShake = useCallback(async () => {
    if (prefersReducedMotion) return;
    
    await controls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 },
    });
  }, [controls, prefersReducedMotion]);

  // Trigger shake when error appears
  useEffect(() => {
    if (hasError) {
      triggerShake();
    }
  }, [hasError, triggerShake]);

  // Handle input change
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  // Animation variants for entrance
  const entranceVariants = prefersReducedMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
      }
    : {
        ...staggerItem,
        animate: {
          ...staggerItem.animate,
          transition: {
            ...staggerItem.transition,
            delay: animationDelay / 1000,
          },
        },
      };

  // Focus animation variants
  const focusVariants = prefersReducedMotion
    ? {}
    : {
        scale: 1.02,
        transition: { duration: 0.2 },
      };

  return (
    <motion.div
      ref={fieldRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        delay: animationDelay / 1000,
      }}
      style={{ width: '100%' }}
    >
      <TextField
        fullWidth
        label={label}
        type={type}
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        error={hasError}
        helperText={hasError ? error : isValid ? '✓ Valid' : ' '}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        InputProps={{
          startAdornment: icon ? (
            <InputAdornment position="start">{icon}</InputAdornment>
          ) : null,
          endAdornment: endAdornment ? (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          ) : null,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.2s ease',
            
            // Default state
            '& fieldset': {
              borderColor: hasError ? 'error.main' : 'rgba(0, 0, 0, 0.23)',
              borderWidth: '1px',
              transition: 'border-color 0.2s ease, border-width 0.2s ease',
            },
            
            // Hover state - only show subtle change, no thick border
            '&:hover fieldset': {
              borderColor: hasError ? 'error.main' : 'rgba(0, 0, 0, 0.4)',
              borderWidth: '1px',
            },
            
            // Focused state - remove all extra effects
            '&.Mui-focused': {
              boxShadow: 'none !important',
              outline: 'none !important',
            },
            '&.Mui-focused fieldset': {
              borderColor: hasError ? 'error.main !important' : isValid ? 'success.main !important' : 'primary.main !important',
              borderWidth: '2px !important',
              boxShadow: 'none !important',
              outline: 'none !important',
            },
            
            // Valid state
            ...(isValid && {
              '& fieldset': {
                borderColor: 'success.main',
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: 'success.main',
                borderWidth: '1px',
              },
            }),
          },
          
          // Remove any input outline
          '& .MuiOutlinedInput-input': {
            '&:focus': {
              outline: 'none !important',
              boxShadow: 'none !important',
            },
          },
          
          // Helper text styling
          '& .MuiFormHelperText-root': {
            color: hasError ? 'error.main' : isValid ? 'success.main' : 'text.secondary',
          },
        }}
        inputProps={{
          'aria-label': label,
          'aria-required': required,
          'aria-invalid': hasError,
          'aria-describedby': hasError ? `${label}-error` : undefined,
        }}
        FormHelperTextProps={{
          id: hasError ? `${label}-error` : undefined,
          role: hasError ? 'alert' : undefined,
          'aria-live': hasError ? 'polite' : undefined,
        }}
      />
    </motion.div>
  );
};

export default AnimatedFormField;