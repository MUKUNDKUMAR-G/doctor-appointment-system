import React, { useMemo } from 'react';

/**
 * GradientMesh Component
 * Renders an animated gradient background with smooth color transitions
 */
const GradientMesh = ({ colors, intensity, parallaxOffset, reduceMotion }) => {
  // Create gradient animation keyframes
  const gradientAnimation = useMemo(() => {
    if (reduceMotion) {
      return null;
    }

    return 'gradientAnimation';
  }, [reduceMotion]);

  // Calculate animation duration based on intensity
  const animationDuration = useMemo(() => {
    const durations = {
      low: 20,
      medium: 15,
      high: 10
    };
    return durations[intensity] || 15;
  }, [intensity]);

  // Create gradient string from colors
  const gradientString = useMemo(() => {
    if (colors.length < 2) {
      return `linear-gradient(135deg, ${colors[0] || '#667eea'}, ${colors[0] || '#667eea'})`;
    }
    
    const colorStops = colors.map((color, index) => {
      const position = (index / (colors.length - 1)) * 100;
      return `${color} ${position}%`;
    }).join(', ');
    
    return `linear-gradient(135deg, ${colorStops})`;
  }, [colors]);

  // Inject keyframes if needed
  React.useEffect(() => {
    if (reduceMotion) return;

    const styleId = 'gradient-mesh-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes gradientAnimation {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, [reduceMotion]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: gradientString,
        backgroundSize: '400% 400%',
        transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)`,
        transition: reduceMotion ? 'none' : 'transform 0.3s ease-out',
        animation: gradientAnimation && !reduceMotion
          ? `${gradientAnimation} ${animationDuration}s ease infinite`
          : 'none',
        willChange: reduceMotion ? 'auto' : 'transform, background-position'
      }}
    />
  );
};

export default GradientMesh;
