/**
 * Authentication utilities barrel export
 */

export {
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText,
  isPasswordValid,
  DEFAULT_PASSWORD_REQUIREMENTS,
} from './passwordStrength';

export {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateName,
  validatePhoneNumber,
  validateLoginForm,
  validateRegisterForm,
} from './validation';
