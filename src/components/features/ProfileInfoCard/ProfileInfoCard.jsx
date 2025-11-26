import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  alpha,
  Collapse,
} from '@mui/material';
import {
  Edit,
  Check,
  Close,
  Person,
  Email,
  Phone,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ModernCard from '../../common/ModernCard';
import AnimatedButton from '../../common/AnimatedButton';
import toast from 'react-hot-toast';

const ProfileInfoCard = ({ user, onSave }) => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          return 'This field is required';
        }
        if (value.trim().length < 2) {
          return 'Must be at least 2 characters';
        }
        return '';
      
      case 'email':
        if (!value.trim()) {
          return 'Email is required';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Invalid email address';
        }
        return '';
      
      case 'phoneNumber':
        if (!value.trim()) {
          return 'Phone number is required';
        }
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value)) {
          return 'Invalid phone number';
        }
        if (value.replace(/\D/g, '').length < 10) {
          return 'Phone number must be at least 10 digits';
        }
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Validate on change if field has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error,
      }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));

    const error = validateField(field, formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleEdit = () => {
    setEditMode(true);
    setErrors({});
    setTouched({});
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
    });
    setEditMode(false);
    setErrors({});
    setTouched({});
  };

  const handleSave = async () => {
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
      });
      toast.error('Please fix the errors before saving');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      setEditMode(false);
      setErrors({});
      setTouched({});
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getFieldIcon = (field) => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return <Person />;
      case 'email':
        return <Email />;
      case 'phoneNumber':
        return <Phone />;
      default:
        return null;
    }
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case 'firstName':
        return 'First Name';
      case 'lastName':
        return 'Last Name';
      case 'email':
        return 'Email Address';
      case 'phoneNumber':
        return 'Phone Number';
      default:
        return field;
    }
  };

  const renderField = (field) => {
    const hasError = touched[field] && errors[field];
    const isValid = touched[field] && !errors[field] && formData[field];

    return (
      <motion.div
        key={field}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Box sx={{ mb: 2.5 }}>
          {editMode ? (
            <TextField
              fullWidth
              label={getFieldLabel(field)}
              value={formData[field]}
              onChange={handleInputChange(field)}
              onBlur={handleBlur(field)}
              error={hasError}
              helperText={hasError ? errors[field] : ''}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {getFieldIcon(field)}
                  </InputAdornment>
                ),
                endAdornment: isValid && (
                  <InputAdornment position="end">
                    <CheckCircle color="success" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                  },
                  '&.Mui-focused': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                  },
                },
              }}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05),
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.secondary',
                  mr: 2,
                }}
              >
                {getFieldIcon(field)}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {getFieldLabel(field)}
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formData[field] || 'Not provided'}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </motion.div>
    );
  };

  return (
    <ModernCard variant="elevated">
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Personal Information
          </Typography>
          
          <AnimatePresence mode="wait">
            {!editMode ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <AnimatedButton
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  variant="outlined"
                  size="small"
                >
                  Edit
                </AnimatedButton>
              </motion.div>
            ) : (
              <motion.div
                key="actions"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <AnimatedButton
                    startIcon={<Close />}
                    onClick={handleCancel}
                    disabled={loading}
                    variant="outlined"
                    size="small"
                  >
                    Cancel
                  </AnimatedButton>
                  <AnimatedButton
                    startIcon={<Check />}
                    onClick={handleSave}
                    loading={loading}
                    variant="contained"
                    size="small"
                  >
                    Save
                  </AnimatedButton>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* Form Fields */}
        <Box>
          {renderField('firstName')}
          {renderField('lastName')}
          {renderField('email')}
          {renderField('phoneNumber')}
        </Box>

        {/* Edit Mode Helper Text */}
        <Collapse in={editMode}>
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <ErrorIcon color="info" fontSize="small" sx={{ mt: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              Make sure all information is accurate. Your email will be used for important notifications.
            </Typography>
          </Box>
        </Collapse>
      </Box>
    </ModernCard>
  );
};

export default ProfileInfoCard;
