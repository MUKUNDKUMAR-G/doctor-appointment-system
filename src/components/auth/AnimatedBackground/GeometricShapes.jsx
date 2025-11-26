import React, { useMemo } from 'react';

/**
 * GeometricShapes Component
 * Renders animated geometric shapes with rotation animations
 */
const GeometricShapes = ({ colors, intensity, parallaxOffset, reduceMotion }) => {
  // Calculate animation duration based on intensity
  const rotationDuration = useMemo(() => {
    const durations = {
      low: 40,
      medium: 30,
      high: 20
    };
    return durations[intensity] || 30;
  }, [intensity]);

  const floatDuration = useMemo(() => {
    const durations = {
      low: 8,
      medium: 6,
      high: 4
    };
    return durations[intensity] || 6;
  }, [intensity]);

  // Generate shapes with different properties
  const shapes = useMemo(() => {
    return [
      {
        type: 'circle',
        size: 200,
        top: '10%',
        left: '10%',
        color: colors[0] || '#667eea',
        opacity: 0.1,
        animationName: 'rotateAnimation',
        duration: rotationDuration
      },
      {
        type: 'square',
        size: 150,
        top: '70%',
        left: '80%',
        color: colors[1] || '#764ba2',
        opacity: 0.08,
        animationName: 'rotateReverseAnimation',
        duration: rotationDuration * 1.2
      },
      {
        type: 'triangle',
        size: 180,
        top: '50%',
        left: '85%',
        color: colors[2] || '#f093fb',
        opacity: 0.09,
        animationName: 'rotateAnimation',
        duration: rotationDuration * 0.8
      },
      {
        type: 'circle',
        size: 120,
        top: '80%',
        left: '15%',
        color: colors[3] || '#4facfe',
        opacity: 0.12,
        animationName: 'rotateReverseAnimation',
        duration: rotationDuration * 1.5
      }
    ];
  }, [colors, rotationDuration]);

  // Inject keyframes if needed
  React.useEffect(() => {
    if (reduceMotion) return;

    const styleId = 'geometric-shapes-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes rotateAnimation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes rotateReverseAnimation {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        @keyframes floatAnimation {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
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
        transform: `translate(${parallaxOffset.x * 0.3}px, ${parallaxOffset.y * 0.3}px)`,
        transition: reduceMotion ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {shapes.map((shape, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: shape.top,
            left: shape.left,
            width: shape.type === 'triangle' ? 0 : shape.size,
            height: shape.type === 'triangle' ? 0 : shape.size,
            opacity: shape.opacity,
            animation: !reduceMotion
              ? `${shape.animationName} ${shape.duration}s linear infinite, floatAnimation ${floatDuration}s ease-in-out infinite`
              : 'none',
            willChange: reduceMotion ? 'auto' : 'transform',
            ...(shape.type === 'circle' && {
              borderRadius: '50%',
              background: `radial-gradient(circle, ${shape.color}, transparent)`
            }),
            ...(shape.type === 'square' && {
              background: `linear-gradient(135deg, ${shape.color}, transparent)`,
              borderRadius: '20px'
            }),
            ...(shape.type === 'triangle' && {
              borderLeft: `${shape.size / 2}px solid transparent`,
              borderRight: `${shape.size / 2}px solid transparent`,
              borderBottom: `${shape.size}px solid ${shape.color}`,
              background: 'none'
            })
          }}
        />
      ))}
    </div>
  );
};

export default GeometricShapes;
