import { useState, useCallback, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import ModernLoginForm from '../ModernLoginForm';
import ModernRegisterForm from '../ModernRegisterForm';

/**
 * @typedef {Object} AuthFormSwitcherProps
 * @property {'login' | 'register'} [initialMode='login'] - Initial form mode
 * @property {() => void} [onLoginSuccess] - Login success handler
 * @property {() => void} [onRegisterSuccess] - Register success handler
 */

/**
 * @typedef {Object} PreservedFormData
 * @property {string} email - Preserved email address
 * @property {string} role - Preserved role selection
 */

/**
 * AuthFormSwitcher component
 * @param {AuthFormSwitcherProps} props
 */
const AuthFormSwitcher = ({
  initialMode = 'login',
  onLoginSuccess,
  onRegisterSuccess,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [mode, setMode] = useState(initialMode);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef(null);

  // Preserve non-sensitive form data between switches
  const [preservedData, setPreservedData] = useState({
    email: '',
    role: 'PATIENT',
  });

  // Switch to register mode
  const handleSwitchToRegister = useCallback(() => {
    setDirection(1); // Slide left
    setMode('register');
  }, []);

  // Switch to login mode
  const handleSwitchToLogin = useCallback(() => {
    setDirection(-1); // Slide right
    setMode('login');
  }, []);

  // Handle login success
  const handleLoginSuccess = useCallback(() => {
    if (onLoginSuccess) {
      onLoginSuccess();
    }
  }, [onLoginSuccess]);

  // Handle register success
  const handleRegisterSuccess = useCallback(() => {
    if (onRegisterSuccess) {
      onRegisterSuccess();
    }
  }, [onRegisterSuccess]);

  // Animation variants for form transitions
  const slideVariants = prefersReducedMotion
    ? {
        enter: { opacity: 1 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (direction) => ({
          x: direction > 0 ? 300 : -300,
          opacity: 0,
        }),
        center: {
          x: 0,
          opacity: 1,
        },
        exit: (direction) => ({
          x: direction > 0 ? -300 : 300,
          opacity: 0,
        }),
      };

  const transition = prefersReducedMotion
    ? { duration: 0.1 }
    : {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      };

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        // Remove fixed minHeight - let content determine height
        transition: 'height 0.3s ease',
      }}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        {mode === 'login' ? (
          <motion.div
            key="login"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            style={{
              width: '100%',
            }}
          >
            <ModernLoginForm
              onSwitchToRegister={handleSwitchToRegister}
              onLoginSuccess={handleLoginSuccess}
              initialEmail={preservedData.email}
            />
          </motion.div>
        ) : (
          <motion.div
            key="register"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            style={{
              width: '100%',
            }}
          >
            <ModernRegisterForm
              onSwitchToLogin={handleSwitchToLogin}
              onRegisterSuccess={handleRegisterSuccess}
              initialRole={preservedData.role}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default AuthFormSwitcher;