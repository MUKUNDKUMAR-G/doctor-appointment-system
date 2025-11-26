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
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { VALIDATION } from '../utils/constants';

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!VALIDATION.EMAIL_REGEX.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }

    // Clear global error when user makes changes
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (event) => {
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
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
        Sign In
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={handleInputChange('email')}
        error={!!formErrors.email}
        helperText={formErrors.email}
        margin="normal"
        required
        autoComplete="email"
        autoFocus
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
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleInputChange('password')}
        error={!!formErrors.password}
        helperText={formErrors.password}
        margin="normal"
        required
        autoComplete="current-password"
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
                onClick={handleTogglePasswordVisibility}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
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
          'Sign In'
        )}
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{' '}
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={onSwitchToRegister}
            sx={{ textDecoration: 'none' }}
          >
            Sign up here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;