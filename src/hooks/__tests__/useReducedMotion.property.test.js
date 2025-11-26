/**
 * Property-based tests for reduced motion accessibility
 * Feature: modern-auth-ui, Property 3: Animation reduction for accessibility
 * Validates: Requirements 6.3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as fc from 'fast-check';
import {
  useReducedMotion,
  getAccessibleAnimation,
  getAccessibleDuration,
} from '../useReducedMotion';

describe('Reduced Motion - Property Tests', () => {
  let matchMediaMock;

  beforeEach(() => {
    // Mock matchMedia
    matchMediaMock = vi.fn();
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Feature: modern-auth-ui, Property 3: Animation reduction for accessibility
   * For any user with reduced motion preferences enabled, all animations should be
   * disabled or minimized to static transitions
   */
  it('should return true when prefers-reduced-motion is enabled', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('should return false when prefers-reduced-motion is disabled', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  /**
   * Feature: modern-auth-ui, Property 3: Animation reduction for accessibility
   * For any animation configuration, when reduced motion is enabled,
   * the duration should be set to 0
   */
  it('should set animation duration to 0 when reduced motion is enabled', () => {
    fc.assert(
      fc.property(
        fc.record({
          initial: fc.record({ opacity: fc.double(), y: fc.integer() }),
          animate: fc.record({ opacity: fc.double(), y: fc.integer() }),
          transition: fc.record({ duration: fc.double({ min: 0, max: 10 }) }),
        }),
        (animation) => {
          const result = getAccessibleAnimation(animation, true);
          
          // When reduced motion is enabled, duration should be 0
          expect(result.transition.duration).toBe(0);
          // Animate should match initial state (no animation)
          expect(result.animate).toEqual(animation.initial);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Animation reduction for accessibility
   * For any animation configuration, when reduced motion is disabled,
   * the animation should remain unchanged
   */
  it('should preserve animation when reduced motion is disabled', () => {
    fc.assert(
      fc.property(
        fc.record({
          initial: fc.record({ opacity: fc.double(), y: fc.integer() }),
          animate: fc.record({ opacity: fc.double(), y: fc.integer() }),
          transition: fc.record({ duration: fc.double({ min: 0, max: 10 }) }),
        }),
        (animation) => {
          const result = getAccessibleAnimation(animation, false);
          
          // When reduced motion is disabled, animation should be unchanged
          expect(result).toEqual(animation);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Animation reduction for accessibility
   * For any duration value, when reduced motion is enabled, it should return 0
   */
  it('should return 0 duration when reduced motion is enabled', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 10000 }),
        (duration) => {
          const result = getAccessibleDuration(duration, true);
          expect(result).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Animation reduction for accessibility
   * For any duration value, when reduced motion is disabled, it should return the original duration
   */
  it('should preserve duration when reduced motion is disabled', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 10000 }),
        (duration) => {
          const result = getAccessibleDuration(duration, false);
          expect(result).toBe(duration);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Animation reduction for accessibility
   * For any animation with exit state, reduced motion should disable exit animations
   */
  it('should disable exit animations when reduced motion is enabled', () => {
    fc.assert(
      fc.property(
        fc.record({
          initial: fc.record({ opacity: fc.double() }),
          animate: fc.record({ opacity: fc.double() }),
          exit: fc.record({ opacity: fc.double() }),
          transition: fc.record({ duration: fc.double({ min: 0, max: 10 }) }),
        }),
        (animation) => {
          const result = getAccessibleAnimation(animation, true);
          
          // Exit animation should match initial state
          expect(result.transition.duration).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Animation reduction for accessibility
   * For any animation configuration without initial state, reduced motion should handle gracefully
   */
  it('should handle animations without initial state', () => {
    fc.assert(
      fc.property(
        fc.record({
          animate: fc.record({ opacity: fc.double(), x: fc.integer() }),
          transition: fc.record({ duration: fc.double({ min: 0, max: 10 }) }),
        }),
        (animation) => {
          const result = getAccessibleAnimation(animation, true);
          
          // Should not throw error
          expect(result).toBeDefined();
          expect(result.transition.duration).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Animation reduction for accessibility
   * For any combination of animation properties, reduced motion should always result in 0 duration
   */
  it('should always set duration to 0 regardless of animation complexity', () => {
    fc.assert(
      fc.property(
        fc.record({
          initial: fc.option(fc.record({ opacity: fc.double() })),
          animate: fc.option(fc.record({ opacity: fc.double() })),
          exit: fc.option(fc.record({ opacity: fc.double() })),
          transition: fc.option(fc.record({ 
            duration: fc.double({ min: 0, max: 10 }),
            delay: fc.option(fc.double({ min: 0, max: 5 })),
            ease: fc.option(fc.constantFrom('linear', 'easeIn', 'easeOut')),
          })),
        }),
        (animation) => {
          const result = getAccessibleAnimation(animation, true);
          
          // Duration should always be 0 when reduced motion is enabled
          expect(result.transition.duration).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Animation reduction for accessibility
   * For any negative duration, the function should handle it gracefully
   */
  it('should handle negative durations gracefully', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1000, max: 0 }),
        (duration) => {
          const resultEnabled = getAccessibleDuration(duration, true);
          const resultDisabled = getAccessibleDuration(duration, false);
          
          // With reduced motion, always 0
          expect(resultEnabled).toBe(0);
          // Without reduced motion, preserve the value (even if negative)
          expect(resultDisabled).toBe(duration);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Animation reduction for accessibility
   * For any animation, enabling reduced motion should never increase duration
   */
  it('should never increase duration when reduced motion is enabled', () => {
    fc.assert(
      fc.property(
        fc.record({
          initial: fc.record({ opacity: fc.double() }),
          animate: fc.record({ opacity: fc.double() }),
          transition: fc.record({ duration: fc.double({ min: 0, max: 10, noNaN: true }) }),
        }),
        (animation) => {
          const result = getAccessibleAnimation(animation, true);
          
          // Result duration should be less than or equal to original
          expect(result.transition.duration).toBeLessThanOrEqual(animation.transition.duration);
        }
      ),
      { numRuns: 100 }
    );
  });
});
