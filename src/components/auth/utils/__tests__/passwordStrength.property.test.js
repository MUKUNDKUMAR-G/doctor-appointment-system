/**
 * Property-based tests for password strength calculation
 * Feature: modern-auth-ui, Property 4: Password strength calculation accuracy
 * Validates: Requirements 4.2
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculatePasswordStrength,
  DEFAULT_PASSWORD_REQUIREMENTS,
  isPasswordValid,
} from '../passwordStrength';

describe('Password Strength Calculation - Property Tests', () => {
  /**
   * Feature: modern-auth-ui, Property 4: Password strength calculation accuracy
   * For any password input, the strength calculation should correctly evaluate
   * all requirements and return a value between 0-100
   */
  it('should always return a percentage between 0 and 100 for any password', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        const result = calculatePasswordStrength(password);
        
        // Percentage must be between 0 and 100 (inclusive)
        expect(result.percentage).toBeGreaterThanOrEqual(0);
        expect(result.percentage).toBeLessThanOrEqual(100);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 4: Password strength calculation accuracy
   * For any password, the score should match the number of met requirements
   */
  it('should have score equal to number of met requirements', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        const result = calculatePasswordStrength(password);
        
        // Count manually how many requirements are met
        const manualCount = result.requirements.filter(req => req.met).length;
        
        // Score should equal the count of met requirements
        expect(result.score).toBe(manualCount);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 4: Password strength calculation accuracy
   * For any password, percentage should be (met requirements / total requirements) * 100
   */
  it('should calculate percentage correctly based on met requirements', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        const result = calculatePasswordStrength(password);
        
        const metCount = result.requirements.filter(req => req.met).length;
        const totalCount = result.requirements.length;
        const expectedPercentage = totalCount > 0 ? (metCount / totalCount) * 100 : 0;
        
        expect(result.percentage).toBe(expectedPercentage);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 4: Password strength calculation accuracy
   * For any password, strength level should match percentage ranges
   */
  it('should assign correct strength level based on percentage', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        const result = calculatePasswordStrength(password);
        
        if (result.percentage < 40) {
          expect(result.strength).toBe('weak');
        } else if (result.percentage < 80) {
          expect(result.strength).toBe('medium');
        } else {
          expect(result.strength).toBe('strong');
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 4: Password strength calculation accuracy
   * Empty password should always have 0% strength
   */
  it('should return 0% for empty password', () => {
    const result = calculatePasswordStrength('');
    
    expect(result.percentage).toBe(0);
    expect(result.score).toBe(0);
    expect(result.strength).toBe('weak');
    expect(result.requirements.every(req => !req.met)).toBe(true);
  });

  /**
   * Feature: modern-auth-ui, Property 4: Password strength calculation accuracy
   * Password meeting all default requirements should have 100% strength
   */
  it('should return 100% for password meeting all requirements', () => {
    // Password that meets all default requirements:
    // - At least 8 characters
    // - Contains lowercase
    // - Contains uppercase
    // - Contains number
    // - Contains special character (@$!%*?&)
    const strongPassword = 'Test123!';
    const result = calculatePasswordStrength(strongPassword);
    
    expect(result.percentage).toBe(100);
    expect(result.score).toBe(DEFAULT_PASSWORD_REQUIREMENTS.length);
    expect(result.strength).toBe('strong');
    expect(result.requirements.every(req => req.met)).toBe(true);
  });

  /**
   * Feature: modern-auth-ui, Property 4: Password strength calculation accuracy
   * For any password, if percentage is 100, isPasswordValid should return true
   */
  it('should validate password as valid when all requirements are met', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        const result = calculatePasswordStrength(password);
        const isValid = isPasswordValid(password);
        
        if (result.percentage === 100) {
          expect(isValid).toBe(true);
        } else {
          expect(isValid).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 4: Password strength calculation accuracy
   * For any password, the number of requirements should match the input requirements array
   */
  it('should return correct number of requirements', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        const result = calculatePasswordStrength(password);
        
        expect(result.requirements.length).toBe(DEFAULT_PASSWORD_REQUIREMENTS.length);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 4: Password strength calculation accuracy
   * For any password, each requirement should have a 'met' boolean property
   */
  it('should mark each requirement with met status', () => {
    fc.assert(
      fc.property(fc.string(), (password) => {
        const result = calculatePasswordStrength(password);
        
        result.requirements.forEach(req => {
          expect(typeof req.met).toBe('boolean');
          expect(req).toHaveProperty('label');
          expect(req).toHaveProperty('test');
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 4: Password strength calculation accuracy
   * For any password, adding characters that meet a requirement should not decrease strength
   */
  it('should never decrease strength when adding characters that meet requirements', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.constantFrom('a', 'A', '1', '@'),
        (basePassword, additionalChar) => {
          const basResult = calculatePasswordStrength(basePassword);
          const extendedResult = calculatePasswordStrength(basePassword + additionalChar);
          
          // Extended password should have >= percentage of base password
          expect(extendedResult.percentage).toBeGreaterThanOrEqual(basResult.percentage);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 4: Password strength calculation accuracy
   * For passwords with specific character types, corresponding requirements should be met
   */
  it('should correctly identify lowercase letters', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.constantFrom('a', 'b', 'z'),
        (base, lowercase) => {
          const password = base + lowercase;
          const result = calculatePasswordStrength(password);
          
          // Find the lowercase requirement
          const lowercaseReq = result.requirements.find(req => 
            req.label.toLowerCase().includes('lowercase')
          );
          
          expect(lowercaseReq.met).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 4: Password strength calculation accuracy
   * For passwords with specific character types, corresponding requirements should be met
   */
  it('should correctly identify uppercase letters', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.constantFrom('A', 'B', 'Z'),
        (base, uppercase) => {
          const password = base + uppercase;
          const result = calculatePasswordStrength(password);
          
          // Find the uppercase requirement
          const uppercaseReq = result.requirements.find(req => 
            req.label.toLowerCase().includes('uppercase')
          );
          
          expect(uppercaseReq.met).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 4: Password strength calculation accuracy
   * For passwords with specific character types, corresponding requirements should be met
   */
  it('should correctly identify numbers', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.constantFrom('0', '5', '9'),
        (base, number) => {
          const password = base + number;
          const result = calculatePasswordStrength(password);
          
          // Find the number requirement
          const numberReq = result.requirements.find(req => 
            req.label.toLowerCase().includes('number')
          );
          
          expect(numberReq.met).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: modern-auth-ui, Property 4: Password strength calculation accuracy
   * For passwords with specific character types, corresponding requirements should be met
   */
  it('should correctly identify special characters', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.constantFrom('@', '$', '!', '%', '*', '?', '&'),
        (base, special) => {
          const password = base + special;
          const result = calculatePasswordStrength(password);
          
          // Find the special character requirement
          const specialReq = result.requirements.find(req => 
            req.label.toLowerCase().includes('special')
          );
          
          expect(specialReq.met).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
