import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useFormErrors } from '../hooks/useFormErrors';
import { VALIDATION, USER_ROLES } from '../utils/constants';

const RegisterForm = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const { register, isLoading } = useAuth();
  const { fieldErrors, generalError, parseError, clearErrors, clearFieldError } = useFormErrors();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.PATIENT,
  });
  const [clientErrors, setClientErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    const checks = [
      password.length >= VALIDATION.PASSWORD_MIN_LENGTH,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[@$!%*?&]/.test(password),
    ];
    
    strength = checks.filter(Boolean).length;
    return (strength / checks.length) * 100;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 40) return 'error';
    if (strength < 80) return 'warning';
    return 'success';
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 40) return 'Weak';
    if (strength < 80) return 'Medium';
    return 'Strong';
  };

  const validateForm = () => {
    const errors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < VALIDATION.NAME_MIN_LENGTH) {
      errors.firstName = `First name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`;
    } else if (formData.firstName.trim().length > VALIDATION.NAME_MAX_LENGTH) {
      errors.firstName = `First name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters`;
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < VALIDATION.NAME_MIN_LENGTH) {
      errors.lastName = `Last name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`;
    } else if (formData.lastName.trim().length > VALIDATION.NAME_MAX_LENGTH) {
      errors.lastName = `Last name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters`;
    }

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!VALIDATION.EMAIL_REGEX.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone number validation
    if (!formData.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!VALIDATION.PHONE_REGEX.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      errors.password = `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`;
    } else if (!VALIDATION.PASSWORD_PATTERN.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Update password strength for password field
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear field errors when user starts typing
    if (clientErrors[field]) {
      setClientErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
    
    // Clear server field errors when user starts typing
    if (fieldErrors[field]) {
      clearFieldError(field);
    }

    // Clear general errors when user makes changes
    if (generalError) {
      clearErrors();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
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
      // Parse and display server errors
      parseError(registerError);
      console.error('Registration failed:', registerError);
    }
  };

  const handleTogglePasswordVisibility = (field) => () => {
    if (field === 'password') {
      setShowPassword(prev => !prev);
    } else if (field === 'confirmPassword') {
      setShowConfirmPassword(prev => !prev);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
        Create Account
      </Typography>

      {generalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {generalError}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            error={!!(clientErrors.firstName || fieldErrors.firstName)}
            helperText={clientErrors.firstName || fieldErrors.firstName}
            required
            autoComplete="given-name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            error={!!(clientErrors.lastName || fieldErrors.lastName)}
            helperText={clientErrors.lastName || fieldErrors.lastName}
            required
            autoComplete="family-name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <TextField
        fullWidth
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={handleInputChange('email')}
        error={!!(clientErrors.email || fieldErrors.email)}
        helperText={clientErrors.email || fieldErrors.email}
        margin="normal"
        required
        autoComplete="email"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email color="action" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Phone Number"
        type="tel"
        value={formData.phoneNumber}
        onChange={handleInputChange('phoneNumber')}
        error={!!(clientErrors.phoneNumber || fieldErrors.phoneNumber)}
        helperText={clientErrors.phoneNumber || fieldErrors.phoneNumber}
        margin="normal"
        required
        autoComplete="tel"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Phone color="action" />
            </InputAdornment>
          ),
        }}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Account Type</InputLabel>
        <Select
          value={formData.role}
          onChange={handleInputChange('role')}
          label="Account Type"
        >
          <MenuItem value={USER_ROLES.PATIENT}>Patient</MenuItem>
          <MenuItem value={USER_ROLES.DOCTOR}>Doctor</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleInputChange('password')}
        error={!!(clientErrors.password || fieldErrors.password)}
        helperText={clientErrors.password || fieldErrors.password}
        margin="normal"
        required
        autoComplete="new-password"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleTogglePasswordVisibility('password')}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {formData.password && (
        <Box sx={{ mt: 1, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Password strength:
            </Typography>
            <Typography 
              variant="caption" 
              color={`${getPasswordStrengthColor(passwordStrength)}.main`}
              sx={{ fontWeight: 'medium' }}
            >
              {getPasswordStrengthText(passwordStrength)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={passwordStrength}
            color={getPasswordStrengthColor(passwordStrength)}
            sx={{ height: 4, borderRadius: 2 }}
          />
          {passwordStrength < 100 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Password must contain: uppercase, lowercase, number, and special character (@$!%*?&)
            </Typography>
          )}
        </Box>
      )}

      <TextField
        fullWidth
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={handleInputChange('confirmPassword')}
        error={!!(clientErrors.confirmPassword || fieldErrors.confirmPassword)}
        helperText={clientErrors.confirmPassword || fieldErrors.confirmPassword}
        margin="normal"
        required
        autoComplete="new-password"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle confirm password visibility"
                onClick={handleTogglePasswordVisibility('confirmPassword')}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2, py: 1.5 }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Create Account'
        )}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={onSwitchToLogin}
            sx={{ textDecoration: 'none' }}
          >
            Sign in here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterForm;