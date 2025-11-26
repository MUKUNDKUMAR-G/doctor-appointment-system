import React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

// Feature detection for backdrop-filter support
const supportsBackdropFilter = () => {
  if (typeof window === 'undefined') return false;
  
  return (
    CSS.supports('backdrop-filter', 'blur(1px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(1px)')
  );
};

const StyledGlassCard = styled(Box, {
  shouldForwardProp: (prop) => 
    !['blur', 'opacity', 'borderRadius', 'padding', 'maxWidth', 'elevation'].includes(prop),
})(({ theme, blur = 20, opacity = 0.7, borderRadius = 16, padding = 4, maxWidth = 480, elevation = 3 }) => {
  const hasBackdropFilter = supportsBackdropFilter();
  
  // Calculate shadow based on elevation (0-5 scale)
  const shadowIntensity = Math.min(Math.max(elevation, 0), 5);
  const shadows = [
    'none',
    '0 4px 16px rgba(0, 0, 0, 0.08)',
    '0 8px 24px rgba(0, 0, 0, 0.1)',
    '0 8px 32px rgba(0, 0, 0, 0.12)',
    '0 12px 40px rgba(0, 0, 0, 0.14)',
    '0 16px 48px rgba(0, 0, 0, 0.16)',
  ];
  
  return {
    position: 'relative',
    width: '100%',
    maxWidth: `${maxWidth}px`,
    padding: theme.spacing(padding),
    borderRadius: `${borderRadius}px`,
    overflow: 'visible', // Prevent content clipping
    
    // Glassmorphism effect
    background: hasBackdropFilter
      ? `rgba(255, 255, 255, ${opacity})`
      : `rgba(255, 255, 255, ${Math.min(opacity + 0.15, 0.95)})`, // Fallback: more opaque
    
    // Backdrop filter with vendor prefix and fallback
    ...(hasBackdropFilter && {
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`, // Safari support
    }),
    
    // Border with subtle transparency
    border: `1px solid rgba(255, 255, 255, ${Math.min(opacity * 0.5, 0.4)})`,
    
    // Shadow for depth
    boxShadow: shadows[shadowIntensity],
    
    // Smooth transitions
    transition: theme.transitions.create(
      ['box-shadow', 'transform', 'border-color'],
      {
        duration: theme.transitions.duration.standard,
        easing: theme.transitions.easing.easeInOut,
      }
    ),
    
    // Responsive adjustments
    [theme.breakpoints.down('sm')]: {
      maxWidth: '100%',
      padding: theme.spacing(Math.max(padding - 1, 2)),
      borderRadius: `${Math.max(borderRadius - 4, 8)}px`,
    },
    
    // Ensure content is above the glass effect
    '& > *': {
      position: 'relative',
      zIndex: 1,
    },
  };
});

const GlassmorphicCard = ({
  children,
  blur = 20,
  opacity = 0.7,
  borderRadius = 16,
  padding = 4,
  maxWidth = 480,
  elevation = 3,
  className,
  ...otherProps
}) => {
  return (
    <StyledGlassCard
      blur={blur}
      opacity={opacity}
      borderRadius={borderRadius}
      padding={padding}
      maxWidth={maxWidth}
      elevation={elevation}
      className={className}
      {...otherProps}
    >
      {children}
    </StyledGlassCard>
  );
};

GlassmorphicCard.propTypes = {
  /** Content to be rendered inside the card */
  children: PropTypes.node.isRequired,
  
  /** Blur intensity in pixels (default: 20) */
  blur: PropTypes.number,
  
  /** Background opacity 0-1 (default: 0.7) */
  opacity: PropTypes.number,
  
  /** Border radius in pixels (default: 16) */
  borderRadius: PropTypes.number,
  
  /** Padding using theme spacing units (default: 4) */
  padding: PropTypes.number,
  
  /** Maximum width in pixels (default: 480) */
  maxWidth: PropTypes.number,
  
  /** Elevation level 0-5 for shadow depth (default: 3) */
  elevation: PropTypes.number,
  
  /** Additional CSS class name */
  className: PropTypes.string,
};

export default GlassmorphicCard;
