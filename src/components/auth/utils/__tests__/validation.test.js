/**
 * Unit tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateName,
  validatePhoneNumber,
  validateLoginForm,
  validateRegisterForm,
} from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('user@example.com').isValid).toBe(true);
      expect(validateEmail('test.user@domain.co.uk').isValid).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('').isValid).toBe(false);
      expect(validateEmail('invalid').isValid).toBe(false);
      expect(validateEmail('user@').isValid).toBe(false);
      expect(validateEmail('@domain.com').isValid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('Test123!').isValid).toBe(true);
      expect(validatePassword('MyP@ssw0rd').isValid).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('').isValid).toBe(false);
      expect(validatePassword('short').isValid).toBe(false);
      expect(validatePassword('nouppercase123!').isValid).toBe(false);
      expect(validatePassword('NOLOWERCASE123!').isValid).toBe(false);
      expect(validatePassword('NoNumbers!').isValid).toBe(false);
      expect(validatePassword('NoSpecial123').isValid).toBe(false);
    });
  });

  describe('validatePasswordConfirmation', () => {
    it('should validate matching passwords', () => {
      expect(validatePasswordConfirmation('Test123!', 'Test123!').isValid).toBe(true);
    });

    it('should reject non-matching passwords', () => {
      expect(validatePasswordConfirmation('Test123!', 'Different123!').isValid).toBe(false);
      expect(validatePasswordConfirmation('Test123!', '').isValid).toBe(false);
    });
  });

  describe('validateName', () => {
    it('should validate correct names', () => {
      expect(validateName('John', 'First name').isValid).toBe(true);
      expect(validateName('Mary Jane', 'Name').isValid).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(validateName('', 'Name').isValid).toBe(false);
      expect(validateName('A', 'Name').isValid).toBe(false);
      expect(validateName('A'.repeat(100), 'Name').isValid).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhoneNumber('+1234567890').isValid).toBe(true);
      expect(validatePhoneNumber('1234567890').isValid).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('').isValid).toBe(false);
      expect(validatePhoneNumber('abc').isValid).toBe(false);
    });
  });

  describe('validateLoginForm', () => {
    it('should validate correct login form', () => {
      const result = validateLoginForm({
        email: 'user@example.com',
        password: 'Test123!',
      });
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should return errors for invalid login form', () => {
      const result = validateLoginForm({
        email: 'invalid',
        password: 'weak',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
      expect(result.errors.password).toBeDefined();
    });
  });

  describe('validateRegisterForm', () => {
    it('should validate correct registration form', () => {
      const result = validateRegisterForm({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        password: 'Test123!',
        confirmPassword: 'Test123!',
        role: 'PATIENT',
      });
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it('should return errors for invalid registration form', () => {
      const result = validateRegisterForm({
        firstName: '',
        lastName: 'D',
        email: 'invalid',
        phoneNumber: 'abc',
        password: 'weak',
        confirmPassword: 'different',
        role: 'PATIENT',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.firstName).toBeDefined();
      expect(result.errors.lastName).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.phoneNumber).toBeDefined();
      expect(result.errors.password).toBeDefined();
      expect(result.errors.confirmPassword).toBeDefined();
    });
  });
});
