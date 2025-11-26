import React, { useState, memo } from 'react';
import { Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { colors } from '../../../theme/colors';
import { animations } from '../../../theme/animations';
import { useMotion } from '../../../contexts/MotionContext';

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => 
    !['variant', 'hover', 'gradient'].includes(prop),
})(({ theme, variant, hover, gradient }) => {
  const baseStyles = {
    position: 'relative',
    overflow: 'hidden',
    transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
    cursor: hover ? 'pointer' : 'default',
  };

  const variantStyles = {
    elevated: {
      boxShadow: theme.shadows[2],
      border: 'none',
      ...(hover && {
        '&:hover': {
          boxShadow: theme.shadows[8],
          transform: 'translateY(-4px)',
        },
      }),
    },
    outlined: {
      boxShadow: 'none',
      border: `1px solid ${theme.palette.grey[200]}`,
      ...(hover && {
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
        },
      }),
    },
    gradient: {
      background: gradient ? colors.gradients[gradient] : colors.gradients.primary,
      color: '#ffffff',
      border: 'none',
      boxShadow: theme.shadows[3],
      ...(hover && {
        '&:hover': {
          boxShadow: theme.shadows[8],
          transform: 'translateY(-4px) scale(1.02)',
        },
      }),
    },
  };

  return {
    ...baseStyles,
    ...variantStyles[variant || 'elevated'],
  };
});

const RippleEffect = styled('span')(({ x, y }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.6)',
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

const ModernCard = memo(({
  children,
  variant = 'elevated',
  hover = false,
  onClick,
  gradient,
  sx,
  role,
  ariaLabel,
  ariaDescribedBy,
  ...props
}) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (event) => {
    if (onClick) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newRipple = {
        x,
        y,
        id: Date.now(),
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
      }, 600);

      onClick(event);
    }
  };

  const handleKeyDown = (event) => {
    // Allow Enter and Space to trigger click for interactive cards
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleClick(event);
    }
  };

  const accessibilityProps = {
    ...(onClick && {
      role: role || 'button',
      tabIndex: 0,
      onKeyDown: handleKeyDown,
    }),
    ...(ariaLabel && { 'aria-label': ariaLabel }),
    ...(ariaDescribedBy && { 'aria-describedby': ariaDescribedBy }),
  };

  return (
    <StyledCard
      variant={variant}
      hover={hover}
      gradient={gradient}
      onClick={handleClick}
      sx={sx}
      {...accessibilityProps}
      {...props}
    >
      {ripples.map((ripple) => (
        <RippleEffect key={ripple.id} x={ripple.x} y={ripple.y} />
      ))}
      {children}
    </StyledCard>
  );
});

ModernCard.displayName = 'ModernCard';

export default ModernCard;
