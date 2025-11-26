/**
 * Property-based tests for PasswordStrengthIndicator component
 * Feature: modern-auth-ui, Property 3: Password requirement checkmarks
 * Validates: Requirements 4.3
 * 
 * These tests verify universal properties that should hold across all inputs
 * using fast-check for property-based testing.
 * 
 * Note: These tests focus on the requirement evaluation logic without full
 * Material-UI rendering to avoid test environment complexities.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculatePasswordStrength, DEFAULT_PASSWORD_REQUIREMENTS } from '../../utils/passwordStrength';

/**
 * Helper function to determine requirement display state
 * This mirrors the logic in PasswordStrengthIndicator component
 */
function getRequirementDisplayState(password, requirements = DEFAULT_PASSWORD_REQUIREMENTS) {
  if (!password) {
    return {
      shouldDisplay: false,
      requirements: [],
    };
  }

  const result = calculatePasswordStrength(password, requirements);
  
  return {
    shouldDisplay: true,
    requirements: result.requirements.map(req => ({
      label: req.label,
      met: req.met,
      iconType: req.met ? 'checkmark' : 'unchecked',
    })),
    percentage: result.percentage,
    strength: result.strength,
  };
}

describe('PasswordStrengthIndicator - Property 3: Password requirement checkmarks', () => {
  /**
   * Feature: modern-auth-ui, Property 3: Password requirement checkmarks
   * For any password, when password requirements are met, the component should
   * display animated checkmarks next to each satisfied requirement
   */
  it('should mark requirements as met with checkmarks when conditions are satisfied', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        const displayState = getRequirementDisplayState(password);
        
        // If no password, component should not display
        if (!password) {
          expect(displayState.shouldDisplay).toBe(false);
          return true;
        }

        // Should display requirements
        expect(displayState.shouldDisplay).toBe(true);
        expect(displayState.requirements.length).toBe(DEFAULT_PASSWORD_REQUIREMENTS.length);

        // Check each requirement
        displayState.requirements.forEach((req, index) => {
          const originalReq = DEFAULT_PASSWORD_REQUIREMENTS[index];
          const isMet = originalReq.test(password);
          
          // Requirement met status should match test result
          expect(req.met).toBe(isMet);
          
          // Icon type should match met status
          if (isMet) {
            expect(req.iconType).toBe('checkmark');
          } else {
            expect(req.iconType).toBe('unchecked');
          }
        });

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Password requirement checkmarks
   * For any password, the number of checkmarks should equal the number of met requirements
   */
  it('should have checkmark count equal to number of met requirements', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        const displayState = getRequirementDisplayState(password);
        
        // Skip empty passwords
        if (!password) return true;

        // Count how many requirements are met
        const metCount = DEFAULT_PASSWORD_REQUIREMENTS.filter(req => req.test(password)).length;

        // Count checkmarks in display state
        const checkmarkCount = displayState.requirements.filter(req => req.iconType === 'checkmark').length;
        
        expect(checkmarkCount).toBe(metCount);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Password requirement checkmarks
   * For any password, all requirements should be displayed in the checklist
   */
  it('should include all requirements in the display state', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        // Skip empty passwords
        if (!password) return true;

        const displayState = getRequirementDisplayState(password);

        // Should have all requirements
        expect(displayState.requirements.length).toBe(DEFAULT_PASSWORD_REQUIREMENTS.length);

        // Check that all requirement labels are present
        DEFAULT_PASSWORD_REQUIREMENTS.forEach((requirement, index) => {
          expect(displayState.requirements[index].label).toBe(requirement.label);
        });

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Password requirement checkmarks
   * For any password meeting all requirements, all checkmarks should be displayed
   */
  it('should show all checkmarks when all requirements are met', () => {
    // Generate passwords that meet all requirements
    const strongPasswordArbitrary = fc.tuple(
      fc.array(fc.constantFrom('a', 'b', 'c', 'd', 'e'), { minLength: 1, maxLength: 3 }).map(arr => arr.join('')), // lowercase
      fc.array(fc.constantFrom('A', 'B', 'C', 'D', 'E'), { minLength: 1, maxLength: 3 }).map(arr => arr.join('')), // uppercase
      fc.array(fc.constantFrom('0', '1', '2', '3', '4'), { minLength: 1, maxLength: 3 }).map(arr => arr.join('')), // numbers
      fc.array(fc.constantFrom('@', '$', '!', '%', '*', '?', '&'), { minLength: 1, maxLength: 2 }).map(arr => arr.join('')), // special
      fc.string({ minLength: 0, maxLength: 4 }) // padding to ensure min length
    ).map(([lower, upper, num, special, padding]) => lower + upper + num + special + padding);

    fc.assert(
      fc.property(strongPasswordArbitrary, (password) => {
        const displayState = getRequirementDisplayState(password);

        // All requirements should be met
        const allMet = DEFAULT_PASSWORD_REQUIREMENTS.every(req => req.test(password));
        
        if (allMet) {
          // Should have checkmarks for all requirements
          const checkmarkCount = displayState.requirements.filter(req => req.iconType === 'checkmark').length;
          expect(checkmarkCount).toBe(DEFAULT_PASSWORD_REQUIREMENTS.length);
          
          // Should have no unchecked icons
          const uncheckedCount = displayState.requirements.filter(req => req.iconType === 'unchecked').length;
          expect(uncheckedCount).toBe(0);
          
          // All requirements should be marked as met
          expect(displayState.requirements.every(req => req.met)).toBe(true);
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Password requirement checkmarks
   * For any password meeting no requirements, no checkmarks should be displayed
   */
  it('should show no checkmarks when no requirements are met', () => {
    // Generate passwords that meet no requirements (empty or very short)
    const weakPasswordArbitrary = fc.constantFrom(' ', '  ', '   ', '    ');

    fc.assert(
      fc.property(weakPasswordArbitrary, (password) => {
        const displayState = getRequirementDisplayState(password);

        // Count how many requirements are met
        const metCount = DEFAULT_PASSWORD_REQUIREMENTS.filter(req => req.test(password)).length;

        if (metCount === 0) {
          // Should have no checkmarks
          const checkmarkCount = displayState.requirements.filter(req => req.iconType === 'checkmark').length;
          expect(checkmarkCount).toBe(0);
          
          // Should have all unchecked icons
          const uncheckedCount = displayState.requirements.filter(req => req.iconType === 'unchecked').length;
          expect(uncheckedCount).toBe(DEFAULT_PASSWORD_REQUIREMENTS.length);
          
          // All requirements should be marked as not met
          expect(displayState.requirements.every(req => !req.met)).toBe(true);
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Password requirement checkmarks
   * For empty password, component should not display
   */
  it('should not display for empty password', () => {
    const displayState = getRequirementDisplayState('');

    // Should not display
    expect(displayState.shouldDisplay).toBe(false);
    expect(displayState.requirements.length).toBe(0);
  });

  /**
   * Feature: modern-auth-ui, Property 3: Password requirement checkmarks
   * For any password, requirement met status should be consistent with test result
   */
  it('should have consistent met status for all requirements', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        // Skip empty passwords
        if (!password) return true;

        const displayState = getRequirementDisplayState(password);

        // Check each requirement's met status
        DEFAULT_PASSWORD_REQUIREMENTS.forEach((requirement, index) => {
          const isMet = requirement.test(password);
          const displayReq = displayState.requirements[index];
          
          // Met status should match test result
          expect(displayReq.met).toBe(isMet);
          
          // Icon type should be consistent with met status
          if (isMet) {
            expect(displayReq.iconType).toBe('checkmark');
          } else {
            expect(displayReq.iconType).toBe('unchecked');
          }
        });

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Password requirement checkmarks
   * For any password with custom requirements, should display those requirements
   */
  it('should handle custom requirements correctly', () => {
    const customRequirements = [
      {
        label: 'At least 10 characters',
        test: (pwd) => pwd.length >= 10,
      },
      {
        label: 'Contains emoji',
        test: (pwd) => /[\u{1F600}-\u{1F64F}]/u.test(pwd),
      },
    ];

    fc.assert(
      fc.property(fc.string(), (password) => {
        // Skip empty passwords
        if (!password) return true;

        const displayState = getRequirementDisplayState(password, customRequirements);

        // Should display custom requirements
        expect(displayState.requirements.length).toBe(customRequirements.length);

        // Check that custom labels are present and met status is correct
        customRequirements.forEach((requirement, index) => {
          const displayReq = displayState.requirements[index];
          expect(displayReq.label).toBe(requirement.label);
          
          const isMet = requirement.test(password);
          expect(displayReq.met).toBe(isMet);
          expect(displayReq.iconType).toBe(isMet ? 'checkmark' : 'unchecked');
        });

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Password requirement checkmarks
   * For any password, progress bar percentage should match met requirements percentage
   */
  it('should calculate correct percentage based on met requirements', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        // Skip empty passwords
        if (!password) return true;

        const displayState = getRequirementDisplayState(password);

        // Calculate expected percentage
        const metCount = DEFAULT_PASSWORD_REQUIREMENTS.filter(req => req.test(password)).length;
        const expectedPercentage = (metCount / DEFAULT_PASSWORD_REQUIREMENTS.length) * 100;

        // Percentage should match
        expect(displayState.percentage).toBe(expectedPercentage);

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Password requirement checkmarks
   * For any password, strength level should be consistent with percentage
   */
  it('should assign correct strength level based on percentage', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        // Skip empty passwords
        if (!password) return true;

        const displayState = getRequirementDisplayState(password);

        // Verify strength level matches percentage ranges
        if (displayState.percentage < 40) {
          expect(displayState.strength).toBe('weak');
        } else if (displayState.percentage < 80) {
          expect(displayState.strength).toBe('medium');
        } else {
          expect(displayState.strength).toBe('strong');
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 3: Password requirement checkmarks
   * For any password, each requirement should have both label and met status
   */
  it('should include complete information for each requirement', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        // Skip empty passwords
        if (!password) return true;

        const displayState = getRequirementDisplayState(password);

        // Each requirement should have all necessary properties
        displayState.requirements.forEach((req) => {
          expect(req).toHaveProperty('label');
          expect(req).toHaveProperty('met');
          expect(req).toHaveProperty('iconType');
          
          expect(typeof req.label).toBe('string');
          expect(typeof req.met).toBe('boolean');
          expect(['checkmark', 'unchecked']).toContain(req.iconType);
        });

        return true;
      }),
      { numRuns: 100 }
    );
  });
});
