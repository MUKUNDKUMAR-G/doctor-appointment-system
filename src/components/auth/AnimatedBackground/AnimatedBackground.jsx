import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import GradientMesh from './GradientMesh';
import ParticleSystem from './ParticleSystem';
import GeometricShapes from './GeometricShapes';

/**
 * AnimatedBackground Component
 * Provides an engaging, animated background with multiple variants
 * 
 * @param {Object} props
 * @param {'gradient' | 'particles' | 'geometric' | 'combined'} props.variant - Background variant
 * @param {'low' | 'medium' | 'high'} props.intensity - Animation intensity
 * @param {string[]} props.colors - Array of colors for gradients/particles
 * @param {boolean} props.enableParallax - Enable mouse parallax effect
 * @param {number} props.particleCount - Number of particles to render
 * @param {boolean} props.reduceMotion - Override for reduced motion
 */
const AnimatedBackground = ({
  variant = 'combined',
  intensity = 'medium',
  colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
  enableParallax = true,
  particleCount: initialParticleCount,
  reduceMotion: reduceMotionOverride
}) => {
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = reduceMotionOverride ?? prefersReducedMotion;
  
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [performanceLevel, setPerformanceLevel] = useState('high');
  const rafRef = useRef(null);
  const lastUpdateRef = useRef(0);

  // Detect performance level
  useEffect(() => {
    const detectPerformance = () => {
      // Check for hardware concurrency (CPU cores)
      const cores = navigator.hardwareConcurrency || 2;
      
      // Check for device memory (if available)
      const memory = navigator.deviceMemory || 4;
      
      // Simple performance heuristic
      if (cores >= 8 && memory >= 8) {
        setPerformanceLevel('high');
      } else if (cores >= 4 && memory >= 4) {
        setPerformanceLevel('medium');
      } else {
        setPerformanceLevel('low');
      }
    };

    detectPerformance();
  }, []);

  // Calculate particle count based on performance and intensity
  const particleCount = useMemo(() => {
    if (initialParticleCount !== undefined) {
      return initialParticleCount;
    }

    if (shouldReduceMotion) {
      return 0;
    }

    const baseCount = {
      low: 20,
      medium: 50,
      high: 100
    }[intensity];

    const performanceMultiplier = {
      low: 0.3,
      medium: 0.6,
      high: 1.0
    }[performanceLevel];

    return Math.floor(baseCount * performanceMultiplier);
  }, [initialParticleCount, shouldReduceMotion, intensity, performanceLevel]);

  // Mouse parallax effect with RAF optimization
  useEffect(() => {
    if (!enableParallax || shouldReduceMotion) {
      return;
    }

    const handleMouseMove = (event) => {
      const now = performance.now();
      
      // Throttle to ~60fps (16ms)
      if (now - lastUpdateRef.current < 16) {
        return;
      }

      lastUpdateRef.current = now;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;
          
          setMousePosition({ x, y });
        }
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enableParallax, shouldReduceMotion]);

  // Calculate parallax offset
  const parallaxOffset = useMemo(() => {
    if (!enableParallax || shouldReduceMotion) {
      return { x: 0, y: 0 };
    }

    const maxOffset = {
      low: 10,
      medium: 20,
      high: 30
    }[intensity];

    return {
      x: (mousePosition.x - 0.5) * maxOffset,
      y: (mousePosition.y - 0.5) * maxOffset
    };
  }, [mousePosition, enableParallax, shouldReduceMotion, intensity]);

  const showGradient = variant === 'gradient' || variant === 'combined';
  const showParticles = variant === 'particles' || variant === 'combined';
  const showGeometric = variant === 'geometric' || variant === 'combined';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    >
      {showGradient && (
        <GradientMesh
          colors={colors}
          intensity={intensity}
          parallaxOffset={parallaxOffset}
          reduceMotion={shouldReduceMotion}
        />
      )}
      
      {showParticles && particleCount > 0 && (
        <ParticleSystem
          count={particleCount}
          colors={colors}
          intensity={intensity}
          parallaxOffset={parallaxOffset}
          reduceMotion={shouldReduceMotion}
        />
      )}
      
      {showGeometric && (
        <GeometricShapes
          colors={colors}
          intensity={intensity}
          parallaxOffset={parallaxOffset}
          reduceMotion={shouldReduceMotion}
        />
      )}
    </div>
  );
};

export default AnimatedBackground;
