/**
 * ModernRegisterForm Example
 * 
 * Demonstrates the usage of ModernRegisterForm component with different configurations.
 */

import { useState } from 'react';
import { Box, Container, Paper, Typography, Button, Stack } from '@mui/material';
import ModernRegisterForm from './ModernRegisterForm';
import AnimatedBackground from '../AnimatedBackground';
import GlassmorphicCard from '../GlassmorphicCard';

/**
 * Example 1: Basic Usage
 * Simple registration form with default settings
 */
export function BasicRegisterFormExample() {
  const [formState, setFormState] = useState('register');

  const handleSwitchToLogin = () => {
    setFormState('login');
    console.log('Switching to login...');
  };

  const handleRegisterSuccess = () => {
    console.log('Registration successful!');
    alert('Registration successful! Redirecting to dashboard...');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Basic Registration Form
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Default configuration with PATIENT role
        </Typography>
        <ModernRegisterForm
          onSwitchToLogin={handleSwitchToLogin}
          onRegisterSuccess={handleRegisterSuccess}
        />
      </Paper>
    </Container>
  );
}

/**
 * Example 2: With Initial Role
 * Registration form with pre-selected DOCTOR role
 */
export function DoctorRegisterFormExample() {
  const handleSwitchToLogin = () => {
    console.log('Switching to login...');
  };

  const handleRegisterSuccess = () => {
    console.log('Doctor registration successful!');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Doctor Registration Form
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Pre-selected DOCTOR role
        </Typography>
        <ModernRegisterForm
          onSwitchToLogin={handleSwitchToLogin}
          onRegisterSuccess={handleRegisterSuccess}
          initialRole="DOCTOR"
        />
      </Paper>
    </Container>
  );
}

/**
 * Example 3: With Animated Background
 * Full authentication page experience with glassmorphic card
 */
export function FullPageRegisterExample() {
  const [currentForm, setCurrentForm] = useState('register');

  const handleSwitchToLogin = () => {
    setCurrentForm('login');
  };

  const handleRegisterSuccess = () => {
    console.log('Registration successful!');
    alert('Welcome! Your account has been created.');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background */}
      <AnimatedBackground
        variant="combined"
        intensity="medium"
        enableParallax={true}
      />

      {/* Glassmorphic Card with Form */}
      <GlassmorphicCard
        maxWidth={500}
        elevation={3}
      >
        <ModernRegisterForm
          onSwitchToLogin={handleSwitchToLogin}
          onRegisterSuccess={handleRegisterSuccess}
        />
      </GlassmorphicCard>
    </Box>
  );
}

/**
 * Example 4: Role Switching Demo
 * Demonstrates role switching behavior
 */
export function RoleSwitchingExample() {
  const [selectedRole, setSelectedRole] = useState('PATIENT');

  const handleSwitchToLogin = () => {
    console.log('Switching to login...');
  };

  const handleRegisterSuccess = () => {
    console.log('Registration successful!');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Role Switching Demo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Change the initial role to see how the form adapts
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant={selectedRole === 'PATIENT' ? 'contained' : 'outlined'}
              onClick={() => setSelectedRole('PATIENT')}
            >
              Patient Role
            </Button>
            <Button
              variant={selectedRole === 'DOCTOR' ? 'contained' : 'outlined'}
              onClick={() => setSelectedRole('DOCTOR')}
            >
              Doctor Role
            </Button>
          </Stack>
        </Paper>

        <Paper elevation={3} sx={{ p: 4 }}>
          <ModernRegisterForm
            key={selectedRole} // Force re-render on role change
            onSwitchToLogin={handleSwitchToLogin}
            onRegisterSuccess={handleRegisterSuccess}
            initialRole={selectedRole}
          />
        </Paper>
      </Stack>
    </Container>
  );
}

/**
 * Example 5: Validation Demo
 * Shows validation behavior with pre-filled invalid data
 */
export function ValidationDemoExample() {
  const handleSwitchToLogin = () => {
    console.log('Switching to login...');
  };

  const handleRegisterSuccess = () => {
    console.log('Registration successful!');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Validation Demo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Try submitting the form to see validation in action
        </Typography>
        <Typography variant="caption" color="info.main" sx={{ mb: 2, display: 'block' }}>
          Tips:
          <br />
          • Leave fields empty to see required validation
          <br />
          • Enter invalid email format
          <br />
          • Use weak password to see strength indicator
          <br />
          • Mismatch passwords to see confirmation error
        </Typography>
        <ModernRegisterForm
          onSwitchToLogin={handleSwitchToLogin}
          onRegisterSuccess={handleRegisterSuccess}
        />
      </Paper>
    </Container>
  );
}

/**
 * Example 6: Accessibility Demo
 * Demonstrates keyboard navigation and screen reader support
 */
export function AccessibilityDemoExample() {
  const handleSwitchToLogin = () => {
    console.log('Switching to login...');
  };

  const handleRegisterSuccess = () => {
    console.log('Registration successful!');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Accessibility Demo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Keyboard navigation and screen reader support
        </Typography>
        <Typography variant="caption" color="info.main" sx={{ mb: 2, display: 'block' }}>
          Accessibility Features:
          <br />
          • Tab through all fields
          <br />
          • Enter key to submit
          <br />
          • ARIA labels on all inputs
          <br />
          • Error announcements for screen readers
          <br />
          • Focus indicators on all interactive elements
        </Typography>
        <ModernRegisterForm
          onSwitchToLogin={handleSwitchToLogin}
          onRegisterSuccess={handleRegisterSuccess}
        />
      </Paper>
    </Container>
  );
}

/**
 * Default export: All examples in a showcase
 */
export default function ModernRegisterFormShowcase() {
  const [activeExample, setActiveExample] = useState('basic');

  const examples = {
    basic: <BasicRegisterFormExample />,
    doctor: <DoctorRegisterFormExample />,
    fullPage: <FullPageRegisterExample />,
    roleSwitching: <RoleSwitchingExample />,
    validation: <ValidationDemoExample />,
    accessibility: <AccessibilityDemoExample />,
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom align="center">
          ModernRegisterForm Examples
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Interactive examples demonstrating different use cases
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Button
            variant={activeExample === 'basic' ? 'contained' : 'outlined'}
            onClick={() => setActiveExample('basic')}
          >
            Basic
          </Button>
          <Button
            variant={activeExample === 'doctor' ? 'contained' : 'outlined'}
            onClick={() => setActiveExample('doctor')}
          >
            Doctor Role
          </Button>
          <Button
            variant={activeExample === 'fullPage' ? 'contained' : 'outlined'}
            onClick={() => setActiveExample('fullPage')}
          >
            Full Page
          </Button>
          <Button
            variant={activeExample === 'roleSwitching' ? 'contained' : 'outlined'}
            onClick={() => setActiveExample('roleSwitching')}
          >
            Role Switching
          </Button>
          <Button
            variant={activeExample === 'validation' ? 'contained' : 'outlined'}
            onClick={() => setActiveExample('validation')}
          >
            Validation
          </Button>
          <Button
            variant={activeExample === 'accessibility' ? 'contained' : 'outlined'}
            onClick={() => setActiveExample('accessibility')}
          >
            Accessibility
          </Button>
        </Stack>

        {examples[activeExample]}
      </Container>
    </Box>
  );
}
