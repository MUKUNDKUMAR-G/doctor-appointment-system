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
  Grid,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, Phone } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import AnimatedFormField from '../AnimatedFormField/AnimatedFormField';
import PasswordStrengthIndicator from '../PasswordStrengthIndicator/PasswordStrengthIndicator';
import RoleSelector from '../RoleSelector/RoleSelector';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateName,
  validatePhoneNumber,
} from '../utils/validation';
import { staggerContainer } from '../../../theme/animations';

/**
 * @typedef {import('../types').ModernRegisterFormProps} ModernRegisterFormProps
 * @typedef {import('../types').RegisterFormState} RegisterFormState
 */

/**
 * ModernRegisterForm component
 * @param {ModernRegisterFormProps} props
 */
const ModernRegisterForm = ({ onSwitchToLogin, onRegisterSuccess, initialRole = 'PATIENT' }) => {
  const { register, isLoading, error, clearError } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const firstFieldRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      case 'firstName': {
        const result = validateName(value, 'First name');
        return result.isValid ? null : result.error;
      }
      case 'lastName': {
        const result = validateName(value, 'Last name');
        return result.isValid ? null : result.error;
      }
      case 'email': {
        const result = validateEmail(value);
        return result.isValid ? null : result.error;
      }
      case 'phoneNumber': {
        const result = validatePhoneNumber(value);
        return result.isValid ? null : result.error;
      }
      case 'password': {
        const result = validatePassword(value);
        return result.isValid ? null : result.error;
      }
      case 'confirmPassword': {
        const result = validatePasswordConfirmation(formData.password, value);
        return result.isValid ? null : result.error;
      }
      default:
        return null;
    }
  }, [formData.password]);

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

    // Also revalidate confirmPassword when password changes
    if (fieldName === 'password' && touched.confirmPassword) {
      const confirmError = validatePasswordConfirmation(value, formData.confirmPassword);
      setFormErrors(prev => ({
        ...prev,
        confirmPassword: confirmError.isValid ? null : confirmError.error,
      }));
    }
  }, [formErrors, error, touched, validateField, clearError, formData.confirmPassword]);

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

  // Handle role change
  const handleRoleChange = useCallback((newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
    }));
  }, []);

  // Toggle password visibility
  const handleTogglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Toggle confirm password visibility
  const handleToggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  // Validate entire form
  const validateForm = useCallback(() => {
    const errors = {};

    const firstNameError = validateField('firstName', formData.firstName);
    if (firstNameError) {
      errors.firstName = firstNameError;
    }

    const lastNameError = validateField('lastName', formData.lastName);
    if (lastNameError) {
      errors.lastName = lastNameError;
    }

    const emailError = validateField('email', formData.email);
    if (emailError) {
      errors.email = emailError;
    }

    const phoneError = validateField('phoneNumber', formData.phoneNumber);
    if (phoneError) {
      errors.phoneNumber = phoneError;
    }

    const passwordError = validateField('password', formData.password);
    if (passwordError) {
      errors.password = passwordError;
    }

    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
    if (confirmPasswordError) {
      errors.confirmPassword = confirmPasswordError;
    }

    setFormErrors(errors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true,
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
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        role: formData.role,
      };

      await register(registrationData);
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (registerError) {
      // Error is handled by the AuthContext
      console.error('Registration failed:', registerError);
    }
  }, [formData, validateForm, register, onRegisterSuccess]);

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

  // Doctor-specific fields (for future use)
  const isDoctorRole = formData.role === 'DOCTOR';

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
        Create Account
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

      {/* Name Fields */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <Box ref={firstFieldRef}>
            <AnimatedFormField
              label="First Name"
              type="text"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              onBlur={handleBlur('firstName')}
              onFocus={handleFocus('firstName')}
              error={formErrors.firstName}
              touched={touched.firstName}
              required
              autoComplete="given-name"
              icon={<Person />}
              animationDelay={100}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6}>
          <AnimatedFormField
            label="Last Name"
            type="text"
            value={formData.lastName}
            onChange={handleChange('lastName')}
            onBlur={handleBlur('lastName')}
            onFocus={handleFocus('lastName')}
            error={formErrors.lastName}
            touched={touched.lastName}
            required
            autoComplete="family-name"
            icon={<Person />}
            animationDelay={150}
          />
        </Grid>
      </Grid>

      {/* Email Field */}
      <Box sx={{ mb: 2 }}>
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
          animationDelay={200}
        />
      </Box>

      {/* Phone Number Field */}
      <Box sx={{ mb: 2 }}>
        <AnimatedFormField
          label="Phone Number"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleChange('phoneNumber')}
          onBlur={handleBlur('phoneNumber')}
          onFocus={handleFocus('phoneNumber')}
          error={formErrors.phoneNumber}
          touched={touched.phoneNumber}
          required
          autoComplete="tel"
          icon={<Phone />}
          animationDelay={250}
        />
      </Box>

      {/* Role Selector */}
      <Box sx={{ mb: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
            delay: 0.3,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              mb: 1.5,
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            Select Your Role
          </Typography>
          <RoleSelector
            value={formData.role}
            onChange={handleRoleChange}
            roles={[
              {
                value: 'PATIENT',
                label: 'Patient',
                icon: <Person size={32} />,
                description: 'Book and manage appointments',
                color: '#667eea',
              },
              {
                value: 'DOCTOR',
                label: 'Doctor',
                icon: <Person size={32} />,
                description: 'Manage patient appointments',
                color: '#10b981',
              },
            ]}
          />
        </motion.div>
      </Box>

      {/* Conditional Doctor Fields - Reserved for future implementation */}
      <AnimatePresence mode="wait">
        {isDoctorRole && (
          <motion.div
            key="doctor-fields"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{ overflow: 'hidden' }}
          >
            {/* Doctor-specific fields can be added here in the future */}
            <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2" color="info.dark">
                Additional doctor verification fields will be available soon.
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

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
          autoComplete="new-password"
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
          animationDelay={350}
        />
      </Box>

      {/* Password Strength Indicator */}
      <Box sx={{ mb: 1.5 }}>
        <PasswordStrengthIndicator password={formData.password} />
      </Box>

      {/* Confirm Password Field */}
      <Box sx={{ mb: 1.5 }}>
        <AnimatedFormField
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange('confirmPassword')}
          onBlur={handleBlur('confirmPassword')}
          onFocus={handleFocus('confirmPassword')}
          error={formErrors.confirmPassword}
          touched={touched.confirmPassword}
          required
          autoComplete="new-password"
          icon={<Lock />}
          endAdornment={
            <IconButton
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              onClick={handleToggleConfirmPasswordVisibility}
              edge="end"
              tabIndex={-1}
            >
              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          }
          animationDelay={400}
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
          mt: 1.5,
          mb: 1,
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
          'Create Account'
        )}
      </Button>

      {/* Switch to Login Link */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={onSwitchToLogin}
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
            Sign in here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default ModernRegisterForm;
