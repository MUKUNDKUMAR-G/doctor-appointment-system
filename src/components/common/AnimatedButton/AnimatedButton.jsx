import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { animations } from '../../../theme/animations';
import { useMotion } from '../../../contexts/MotionContext';

const StyledButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
  '&:hover': {
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
  '&.Mui-disabled': {
    transform: 'none',
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
    '&:hover': {
      transform: 'none',
    },
    '&:active': {
      transform: 'none',
    },
  },
}));

const RippleEffect = styled('span')(({ x, y, color }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: color === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.3)',
  width: '20px',
  height: '20px',
  left: `${x}px`,
  top: `${y}px`,
  transform: 'translate(-50%, -50%)',
  animation: 'ripple 600ms ease-out',
  pointerEvents: 'none',
  '@keyframes ripple': {
    '0%': {
      transform: 'translate(-50%, -50%) scale(0)',
      opacity: 1,
    },
    '100%': {
      transform: 'translate(-50%, -50%) scale(20)',
      opacity: 0,
    },
  },
}));

const IconWrapper = styled('span')(({ position }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  marginRight: position === 'start' ? '8px' : 0,
  marginLeft: position === 'end' ? '8px' : 0,
}));

const LoadingWrapper = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  marginRight: '8px',
});

const AnimatedButton = ({
  children,
  variant = 'contained',
  color = 'primary',
  loading = false,
  icon,
  iconPosition = 'start',
  ripple = true,
  onClick,
  disabled,
  ariaLabel,
  ariaDescribedBy,
  ariaPressed,
  ...props
}) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (event) => {
    if (ripple && !disabled && !loading) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newRipple = {
        x,
        y,
        id: Date.now(),
        color: variant === 'contained' ? 'light' : 'dark',
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
      }, 600);
    }

    if (onClick && !disabled && !loading) {
      onClick(event);
    }
  };

  const accessibilityProps = {
    ...(ariaLabel && { 'aria-label': ariaLabel }),
    ...(ariaDescribedBy && { 'aria-describedby': ariaDescribedBy }),
    ...(ariaPressed !== undefined && { 'aria-pressed': ariaPressed }),
    ...(loading && { 'aria-busy': true }),
  };

  return (
    <StyledButton
      variant={variant}
      color={color}
      onClick={handleClick}
      disabled={disabled || loading}
      {...accessibilityProps}
      {...props}
    >
      {ripples.map((ripple) => (
        <RippleEffect
          key={ripple.id}
          x={ripple.x}
          y={ripple.y}
          color={ripple.color}
        />
      ))}
      {loading && (
        <LoadingWrapper>
          <CircularProgress
            size={16}
            color="inherit"
            sx={{ opacity: 0.8 }}
          />
        </LoadingWrapper>
      )}
      {icon && iconPosition === 'start' && !loading && (
        <IconWrapper position="start">{icon}</IconWrapper>
      )}
      {children}
      {icon && iconPosition === 'end' && !loading && (
        <IconWrapper position="end">{icon}</IconWrapper>
      )}
    </StyledButton>
  );
};

export default AnimatedButton;
