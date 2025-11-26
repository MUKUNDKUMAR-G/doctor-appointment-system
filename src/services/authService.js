import api from './api';
import { endpoints } from '../utils/config';
import { STORAGE_KEYS, VALIDATION } from '../utils/constants';

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      // Validate credentials before sending
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      if (!VALIDATION.EMAIL_REGEX.test(credentials.email)) {
        throw new Error('Please enter a valid email address');
      }

      const response = await api.post(endpoints.auth.login, {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
      });

      return response.data;
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        const errorData = error.response.data;
        throw new Error(errorData.message || errorData.error || 'Login failed');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Login failed');
      }
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      // Validate user data before sending
      const validationError = validateRegistrationData(userData);
      if (validationError) {
        throw new Error(validationError);
      }

      const response = await api.post(endpoints.auth.register, {
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        phoneNumber: userData.phoneNumber.trim(),
        role: userData.role || 'PATIENT',
      });

      return response.data;
    } catch (error) {
      // For better error handling, we'll throw the original error
      // and let the component handle parsing
      throw error;
    }
  },

  // Refresh access token
  refreshToken: async (refreshToken) => {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }

      const response = await api.post(endpoints.auth.refresh, { 
        refreshToken 
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        throw new Error(errorData.message || errorData.error || 'Token refresh failed');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Token refresh failed');
      }
    }
  },

  // Logout user
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        await api.post(endpoints.auth.logout, { refreshToken });
      }
    } catch (error) {
      // Even if logout fails on server, we should clear local storage
      console.error('Logout error:', error);
    }
  },

  // Validate current token
  validateToken: async () => {
    try {
      const response = await api.get('/auth/validate');
      return response.data;
    } catch (error) {
      throw new Error('Token validation failed');
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get user profile');
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        throw new Error(errorData.message || errorData.error || 'Profile update failed');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Profile update failed');
      }
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        throw new Error(errorData.message || errorData.error || 'Password change failed');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Password change failed');
      }
    }
  },
};

// Helper function to validate registration data
const validateRegistrationData = (userData) => {
  if (!userData.email || !VALIDATION.EMAIL_REGEX.test(userData.email)) {
    return 'Please enter a valid email address';
  }

  if (!userData.password || userData.password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`;
  }

  // Check password strength - must match backend validation exactly
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  if (!passwordPattern.test(userData.password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)';
  }

  if (!userData.firstName || userData.firstName.trim().length < VALIDATION.NAME_MIN_LENGTH) {
    return `First name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters long`;
  }

  if (!userData.lastName || userData.lastName.trim().length < VALIDATION.NAME_MIN_LENGTH) {
    return `Last name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters long`;
  }

  if (!userData.phoneNumber || !VALIDATION.PHONE_REGEX.test(userData.phoneNumber)) {
    return 'Please enter a valid phone number';
  }

  return null;
};

export default authService;