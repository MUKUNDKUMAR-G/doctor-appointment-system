import React from 'react';
import { Box, Stepper, Step, StepLabel, StepConnector, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Person, CalendarToday, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { animations, slideUp } from '../../../theme/animations';

// Custom styled connector with gradient
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  '&.MuiStepConnector-root': {
    top: 22,
    left: 'calc(-50% + 20px)',
    right: 'calc(50% + 20px)',
  },
  '& .MuiStepConnector-line': {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.grey[300],
    borderRadius: 1,
    transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
  },
  '&.Mui-active .MuiStepConnector-line': {
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  },
  '&.Mui-completed .MuiStepConnector-line': {
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
  },
}));

// Custom step icon with animation
const StepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.grey[300],
  zIndex: 1,
  color: '#fff',
  width: 44,
  height: 44,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  ...(ownerState.active && {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
    boxShadow: `0 4px 16px ${theme.palette.primary.main}40`,
    transform: 'scale(1.1)',
  }),
  ...(ownerState.completed && {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  }),
}));

const CustomStepIcon = (props) => {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <Person />,
    2: <CalendarToday />,
    3: <CheckCircleIcon />,
    4: <CheckCircleIcon />,
  };

  return (
    <StepIconRoot ownerState={{ completed, active }} className={className}>
      <motion.div
        initial={false}
        animate={{
          scale: active ? [1, 1.2, 1] : 1,
          rotate: completed ? [0, 360] : 0,
        }}
        transition={{
          duration: animations.duration.complex / 1000,
          ease: animations.easing.easeInOut,
        }}
      >
        {completed ? <Check /> : icons[String(icon)]}
      </motion.div>
    </StepIconRoot>
  );
};

const BookingWizard = ({ activeStep, steps, children, onBack, onNext, canGoBack, canGoNext }) => {
  return (
    <Box>
      {/* Progress Stepper */}
      <Box sx={{ mb: 4 }}>
        <Stepper 
          activeStep={activeStep} 
          connector={<CustomConnector />}
          sx={{
            '& .MuiStepLabel-label': {
              mt: 1,
              fontSize: '0.875rem',
              fontWeight: 500,
            },
            '& .MuiStepLabel-label.Mui-active': {
              color: 'primary.main',
              fontWeight: 600,
            },
            '& .MuiStepLabel-label.Mui-completed': {
              color: 'primary.main',
              fontWeight: 500,
            },
          }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel StepIconComponent={CustomStepIcon}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Progress Bar */}
        <Box sx={{ mt: 3, px: 2 }}>
          <Box
            sx={{
              height: 6,
              bgcolor: 'grey.200',
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${((activeStep) / (steps.length - 1)) * 100}%` 
              }}
              transition={{
                duration: animations.duration.complex / 1000,
                ease: animations.easing.easeOut,
              }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)',
                borderRadius: 3,
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
            <Typography variant="caption" color="primary.main" fontWeight={600}>
              {Math.round(((activeStep) / (steps.length - 1)) * 100)}% Complete
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Step Content with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          variants={slideUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: animations.duration.standard / 1000,
            ease: animations.easing.easeInOut,
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default BookingWizard;
