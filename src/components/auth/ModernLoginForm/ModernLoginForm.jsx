
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import AnimatedFormField from '../AnimatedFormField/AnimatedFormField';
import { validateEmail, validatePassword } from '../utils/validation';
import { staggerContainer } from '../../../theme/animations';

/**
 * @typedef {import('../types').ModernLoginFormProps} ModernLoginFormProps
 * @typedef {import('../types').LoginFormState} LoginFormState
 */

/**
 * ModernLoginForm component
 * @param {ModernLoginFormProps} props
 */
const ModernLoginForm = ({ onSwitchToRegister, onLoginSuccess, initialEmail = '' }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const firstFieldRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    email: initialEmail,
    password: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Focus first field on mount
  useEffect(() => {
    if (firstFieldRef.current) {
      // Small delay to ensure animations have started
      const timer = setTimeout(() => {
        firstFieldRef.current?.querySelector('input')?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Validate individual field
  const validateField = useCallback((fieldName, value) => {
    switch (fieldName) {
      case 'email': {
        const result = validateEmail(value);
        return result.isValid ? null : result.error;
      }
      case 'password': {
        const result = validatePassword(value);
        return result.isValid ? null : result.error;
      }
      default:
        return null;
    }
  }, []);

  // Handle input change
  const handleChange = useCallback((fieldName) => (value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: null,
      }));
    }

    // Clear global error when user makes changes
    if (error) {
      clearError();
    }

    // Validate on change if field has been touched
    if (touched[fieldName]) {
      const fieldError = validateField(fieldName, value);
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: fieldError,
      }));
    }
  }, [formErrors, error, touched, validateField, clearError]);

  // Handle field blur
  const handleBlur = useCallback((fieldName) => () => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true,
    }));

    // Validate on blur
    const fieldError = validateField(fieldName, formData[fieldName]);
    setFormErrors(prev => ({
      ...prev,
      [fieldName]: fieldError,
    }));
  }, [formData, validateField]);

  // Handle field focus
  const handleFocus = useCallback((fieldName) => () => {
    // Clear global error on focus
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  // Toggle password visibility
  const handleTogglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Validate entire form
  const validateForm = useCallback(() => {
    const errors = {};

    const emailError = validateField('email', formData.email);
    if (emailError) {
      errors.email = emailError;
    }

    const passwordError = validateField('password', formData.password);
    if (passwordError) {
      errors.password = passwordError;
    }

    setFormErrors(errors);
    setTouched({
      email: true,
      password: true,
    });

    return Object.keys(errors).length === 0;
  }, [formData, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (loginError) {
      // Error is handled by the AuthContext
      console.error('Login failed:', loginError);
    }
  }, [formData, validateForm, login, onLoginSuccess]);

  // Handle Enter key on form fields
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' && !isLoading) {
      handleSubmit(event);
    }
  }, [handleSubmit, isLoading]);

  // Animation variants
  const containerVariants = prefersReducedMotion
    ? { initial: {}, animate: {}, exit: {} }
    : staggerContainer;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      sx={{ width: '100%' }}
      noValidate
    >
        {/* Title */}
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            mb: 3,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome Back
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={clearError}
          >
            {error}
          </Alert>
        )}

        {/* Email Field */}
        <Box ref={firstFieldRef} sx={{ mb: 2 }}>
          <AnimatedFormField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
            onFocus={handleFocus('email')}
            error={formErrors.email}
            touched={touched.email}
            required
            autoComplete="email"
            icon={<Email />}
            animationDelay={100}
          />
        </Box>

        {/* Password Field */}
        <Box sx={{ mb: 1.5 }}>
          <AnimatedFormField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
            onFocus={handleFocus('password')}
            error={formErrors.password}
            touched={touched.password}
            required
            autoComplete="current-password"
            icon={<Lock />}
            endAdornment={
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={handleTogglePasswordVisibility}
                edge="end"
                tabIndex={-1}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            }
            animationDelay={200}
          />
        </Box>

        {/* Submit Button */}
        <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{
              mt: 2,
              mb: 2,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                transform: prefersReducedMotion ? 'none' : 'translateY(-2px)',
              },
              '&:active': {
                transform: prefersReducedMotion ? 'none' : 'translateY(0)',
              },
              '&:disabled': {
                background: 'rgba(102, 126, 234, 0.5)',
                boxShadow: 'none',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
        </Button>

        {/* Switch to Register Link */}
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={onSwitchToRegister}
                sx={{
                  textDecoration: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                Sign up here
              </Link>
            </Typography>
        </Box>
    </Box>
  );
};

export default ModernLoginForm;
