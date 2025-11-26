import React, { useMemo } from 'react';
import { Box, Typography, LinearProgress, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import {
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText,
  DEFAULT_PASSWORD_REQUIREMENTS,
} from '../utils/passwordStrength';

/**
 * @typedef {import('../types').PasswordStrengthIndicatorProps} PasswordStrengthIndicatorProps
 */

/**
 * PasswordStrengthIndicator component
 * @param {PasswordStrengthIndicatorProps} props
 */
const PasswordStrengthIndicator = ({
  password,
  requirements = DEFAULT_PASSWORD_REQUIREMENTS,
  showRequirements = true,
}) => {
  const prefersReducedMotion = useReducedMotion();

  // Calculate password strength
  const strengthResult = useMemo(
    () => calculatePasswordStrength(password, requirements),
    [password, requirements]
  );

  const { percentage, strength, requirements: evaluatedRequirements } = strengthResult;

  // Get color for current strength
  const strengthColor = getPasswordStrengthColor(strength);
  const strengthText = getPasswordStrengthText(strength);

  // Animation variants for progress bar
  const progressVariants = prefersReducedMotion
    ? {}
    : {
        initial: { scaleX: 0 },
        animate: { scaleX: 1 },
        transition: { duration: 0.5, ease: 'easeOut' },
      };

  // Animation variants for checkmarks
  const checkmarkVariants = prefersReducedMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      }
    : {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 25 } },
        exit: { scale: 0, opacity: 0, transition: { duration: 0.2 } },
      };

  // Don't show indicator if no password
  if (!password) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {/* Progress Bar */}
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Password Strength
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: `${strengthColor}.main`,
              fontWeight: 600,
              transition: 'color 0.3s ease',
            }}
          >
            {strengthText}
          </Typography>
        </Box>
        <motion.div
          initial="initial"
          animate="animate"
          variants={progressVariants}
          style={{ transformOrigin: 'left' }}
        >
          <LinearProgress
            variant="determinate"
            value={percentage}
            color={strengthColor}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                transition: 'transform 0.3s ease, background-color 0.3s ease',
              },
            }}
          />
        </motion.div>
      </Box>

      {/* Requirements Checklist */}
      {showRequirements && (
        <List dense sx={{ py: 0 }}>
          {evaluatedRequirements.map((requirement, index) => (
            <ListItem
              key={index}
              sx={{
                py: 0.5,
                px: 0,
                minHeight: 32,
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <AnimatePresence mode="wait">
                  {requirement.met ? (
                    <motion.div
                      key="checked"
                      variants={checkmarkVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <CheckCircleIcon
                        sx={{
                          fontSize: 20,
                          color: 'success.main',
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="unchecked"
                      variants={checkmarkVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    >
                      <RadioButtonUncheckedIcon
                        sx={{
                          fontSize: 20,
                          color: 'text.disabled',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </ListItemIcon>
              <ListItemText
                primary={requirement.label}
                primaryTypographyProps={{
                  variant: 'caption',
                  sx: {
                    color: requirement.met ? 'success.main' : 'text.secondary',
                    transition: 'color 0.3s ease',
                    fontWeight: requirement.met ? 500 : 400,
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default PasswordStrengthIndicator;
