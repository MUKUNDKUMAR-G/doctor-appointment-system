/**
 * Password strength calculation utilities
 * Validates password requirements and calculates strength score
 */

import { VALIDATION } from '../../../utils/constants';

/**
 * Default password requirements
 * @type {import('../types').PasswordRequirement[]}
 */
export const DEFAULT_PASSWORD_REQUIREMENTS = [
  {
    label: `At least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
    test: (password) => password.length >= VALIDATION.PASSWORD_MIN_LENGTH,
  },
  {
    label: 'Contains lowercase letter',
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: 'Contains uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'Contains number',
    test: (password) => /\d/.test(password),
  },
  {
    label: 'Contains special character (@$!%*?&)',
    test: (password) => /[@$!%*?&]/.test(password),
  },
];

/**
 * Calculate password strength based on requirements
 * @param {string} password - Password to evaluate
 * @param {import('../types').PasswordRequirement[]} [requirements] - Custom requirements
 * @returns {import('../types').PasswordStrengthResult} Strength result
 */
export function calculatePasswordStrength(password, requirements = DEFAULT_PASSWORD_REQUIREMENTS) {
  if (!password) {
    return {
      score: 0,
      strength: 'weak',
      requirements: requirements.map(req => ({ ...req, met: false })),
      percentage: 0,
    };
  }

  // Test each requirement
  const evaluatedRequirements = requirements.map(req => ({
    ...req,
    met: req.test(password),
  }));

  // Count met requirements
  const metCount = evaluatedRequirements.filter(req => req.met).length;
  const totalCount = requirements.length;

  // Calculate percentage (0-100)
  const percentage = totalCount > 0 ? (metCount / totalCount) * 100 : 0;

  // Determine strength level
  let strength;
  if (percentage < 40) {
    strength = 'weak';
  } else if (percentage < 80) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    score: metCount,
    strength,
    requirements: evaluatedRequirements,
    percentage,
  };
}

/**
 * Get color for password strength level
 * @param {'weak' | 'medium' | 'strong'} strength - Strength level
 * @returns {string} MUI color name
 */
export function getPasswordStrengthColor(strength) {
  switch (strength) {
    case 'weak':
      return 'error';
    case 'medium':
      return 'warning';
    case 'strong':
      return 'success';
    default:
      return 'error';
  }
}

/**
 * Get display text for password strength level
 * @param {'weak' | 'medium' | 'strong'} strength - Strength level
 * @returns {string} Display text
 */
export function getPasswordStrengthText(strength) {
  switch (strength) {
    case 'weak':
      return 'Weak';
    case 'medium':
      return 'Medium';
    case 'strong':
      return 'Strong';
    default:
      return 'Weak';
  }
}

/**
 * Check if password meets all requirements
 * @param {string} password - Password to check
 * @param {import('../types').PasswordRequirement[]} [requirements] - Custom requirements
 * @returns {boolean} True if all requirements are met
 */
export function isPasswordValid(password, requirements = DEFAULT_PASSWORD_REQUIREMENTS) {
  const result = calculatePasswordStrength(password, requirements);
  return result.percentage === 100;
}
