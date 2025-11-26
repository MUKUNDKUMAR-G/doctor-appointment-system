import { VALIDATION } from './constants';

export const validation = {
  // Validate email
  isValidEmail: (email) => {
    if (!email) return false;
    return VALIDATION.EMAIL_REGEX.test(email);
  },

  // Validate phone number
  isValidPhone: (phone) => {
    if (!phone) return false;
    return VALIDATION.PHONE_REGEX.test(phone);
  },

  // Validate password strength
  isValidPassword: (password) => {
    if (!password || password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      return false;
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  },

  // Validate name
  isValidName: (name) => {
    if (!name) return false;
    const trimmedName = name.trim();
    return trimmedName.length >= VALIDATION.NAME_MIN_LENGTH && 
           trimmedName.length <= VALIDATION.NAME_MAX_LENGTH;
  },

  // Get password strength
  getPasswordStrength: (password) => {
    if (!password) return { score: 0, feedback: 'Password is required' };
    
    let score = 0;
    const feedback = [];
    
    if (password.length >= VALIDATION.PASSWORD_MIN_LENGTH) {
      score += 1;
    } else {
      feedback.push(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`);
    }
    
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add uppercase letters');
    }
    
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add lowercase letters');
    }
    
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add numbers');
    }
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Add special characters');
    }
    
    const strength = score <= 2 ? 'weak' : score <= 3 ? 'medium' : 'strong';
    
    return {
      score,
      strength,
      feedback: feedback.join(', '),
      isValid: score >= 4
    };
  },

  // Validate required field
  isRequired: (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },

  // Validate form data
  validateForm: (data, rules) => {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const rule = rules[field];
      const value = data[field];
      
      if (rule.required && !validation.isRequired(value)) {
        errors[field] = `${field} is required`;
        return;
      }
      
      if (value && rule.type) {
        switch (rule.type) {
          case 'email':
            if (!validation.isValidEmail(value)) {
              errors[field] = 'Please enter a valid email address';
            }
            break;
          case 'phone':
            if (!validation.isValidPhone(value)) {
              errors[field] = 'Please enter a valid phone number';
            }
            break;
          case 'password':
            if (!validation.isValidPassword(value)) {
              errors[field] = 'Password must contain uppercase, lowercase, numbers, and special characters';
            }
            break;
          case 'name':
            if (!validation.isValidName(value)) {
              errors[field] = `Name must be between ${VALIDATION.NAME_MIN_LENGTH} and ${VALIDATION.NAME_MAX_LENGTH} characters`;
            }
            break;
        }
      }
      
      if (value && rule.minLength && value.length < rule.minLength) {
        errors[field] = `${field} must be at least ${rule.minLength} characters`;
      }
      
      if (value && rule.maxLength && value.length > rule.maxLength) {
        errors[field] = `${field} must be no more than ${rule.maxLength} characters`;
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },
};

export default validation;