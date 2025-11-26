/**
 * Form validation utilities for authentication
 * Provides validation functions for login and registration forms
 */

import { VALIDATION } from '../../../utils/constants';

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {{isValid: boolean, error?: string}} Validation result
 */
export function validateEmail(email) {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!VALIDATION.EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {{isValid: boolean, error?: string}} Validation result
 */
export function validatePassword(password) {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
    };
  }

  if (!VALIDATION.PASSWORD_PATTERN.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)',
    };
  }

  return { isValid: true };
}

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {{isValid: boolean, error?: string}} Validation result
 */
export function validatePasswordConfirmation(password, confirmPassword) {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true };
}

/**
 * Validate name (first or last)
 * @param {string} name - Name to validate
 * @param {string} fieldName - Field name for error message
 * @returns {{isValid: boolean, error?: string}} Validation result
 */
export function validateName(name, fieldName = 'Name') {
  if (!name || !name.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < VALIDATION.NAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`,
    };
  }

  if (trimmedName.length > VALIDATION.NAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `${fieldName} must be less than ${VALIDATION.NAME_MAX_LENGTH} characters`,
    };
  }

  return { isValid: true };
}

/**
 * Validate phone number
 * @param {string} phoneNumber - Phone number to validate
 * @returns {{isValid: boolean, error?: string}} Validation result
 */
export function validatePhoneNumber(phoneNumber) {
  if (!phoneNumber || !phoneNumber.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  if (!VALIDATION.PHONE_REGEX.test(phoneNumber)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }

  return { isValid: true };
}

/**
 * Validate login form data
 * @param {{email: string, password: string}} formData - Form data to validate
 * @returns {{isValid: boolean, errors: Record<string, string>}} Validation result
 */
export function validateLoginForm(formData) {
  const errors = {};

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate registration form data
 * @param {import('../types').RegisterFormState} formData - Form data to validate
 * @returns {{isValid: boolean, errors: Record<string, string>}} Validation result
 */
export function validateRegisterForm(formData) {
  const errors = {};

  const firstNameValidation = validateName(formData.firstName, 'First name');
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.error;
  }

  const lastNameValidation = validateName(formData.lastName, 'Last name');
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.error;
  }

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }

  const phoneValidation = validatePhoneNumber(formData.phoneNumber);
  if (!phoneValidation.isValid) {
    errors.phoneNumber = phoneValidation.error;
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }

  const confirmPasswordValidation = validatePasswordConfirmation(
    formData.password,
    formData.confirmPassword
  );
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
