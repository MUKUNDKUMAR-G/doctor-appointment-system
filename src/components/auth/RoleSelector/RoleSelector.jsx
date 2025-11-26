import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { User, Stethoscope, Shield } from 'lucide-react';
import { colors } from '../../../theme/colors';
import { animations } from '../../../theme/animations';

/**
 * RoleSelector Component
 * 
 * Provides visual role selection with icons, theming, and smooth animations.
 * Supports Patient, Doctor, and Admin roles with role-specific color theming.
 * 
 * @param {import('../types').RoleSelectorProps} props
 */
const RoleSelector = ({ value, onChange, roles }) => {
  // Default roles if not provided
  const defaultRoles = [
    {
      value: 'PATIENT',
      label: 'Patient',
      icon: <User size={32} />,
      description: 'Book and manage appointments',
      color: colors.primary.main,
    },
    {
      value: 'DOCTOR',
      label: 'Doctor',
      icon: <Stethoscope size={32} />,
      description: 'Manage patient appointments',
      color: colors.success.main,
    },
    {
      value: 'ADMIN',
      label: 'Administrator',
      icon: <Shield size={32} />,
      description: 'System administration',
      color: colors.secondary.main,
    },
  ];

  const roleOptions = roles || defaultRoles;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        width: '100%',
      }}
    >
      {roleOptions.map((role) => {
        const isSelected = value === role.value;

        return (
          <motion.div
            key={role.value}
            style={{ flex: 1 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: animations.duration.standard / 1000,
              ease: animations.easing.easeOut,
            }}
          >
            <Paper
              component="button"
              type="button"
              onClick={() => onChange(role.value)}
              elevation={isSelected ? 4 : 1}
              sx={{
                width: '100%',
                padding: 2.5,
                cursor: 'pointer',
                border: '2px solid',
                borderColor: isSelected ? role.color : 'transparent',
                backgroundColor: isSelected
                  ? `${role.color}10`
                  : 'background.paper',
                transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: role.color,
                  backgroundColor: `${role.color}08`,
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 24px ${role.color}30`,
                },
                '&:focus-visible': {
                  outline: `3px solid ${role.color}`,
                  outlineOffset: '2px',
                },
                '&:active': {
                  transform: 'translateY(-2px)',
                },
              }}
              aria-pressed={isSelected}
              aria-label={`Select ${role.label} role: ${role.description}`}
            >
              {/* Icon with color transition */}
              <Box
                sx={{
                  color: isSelected ? role.color : 'text.secondary',
                  transition: `color ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {role.icon}
              </Box>

              {/* Role label */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: isSelected ? role.color : 'text.primary',
                  transition: `color ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
                }}
              >
                {role.label}
              </Typography>

              {/* Role description */}
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                }}
              >
                {role.description}
              </Typography>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: role.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              )}
            </Paper>
          </motion.div>
        );
      })}
    </Box>
  );
};

export default RoleSelector;
