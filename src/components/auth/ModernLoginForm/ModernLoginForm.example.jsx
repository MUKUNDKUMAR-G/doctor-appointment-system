/**
 * ModernLoginForm Example
 * 
 * Demonstrates the usage of the ModernLoginForm component
 */

import React from 'react';
import { Box, Container } from '@mui/material';
import ModernLoginForm from './ModernLoginForm';
import AnimatedBackground from '../AnimatedBackground/AnimatedBackground';
import GlassmorphicCard from '../GlassmorphicCard/GlassmorphicCard';

/**
 * Example: Basic ModernLoginForm
 */
export const BasicExample = () => {
  const handleSwitchToRegister = () => {
    console.log('Switch to register form');
  };

  const handleLoginSuccess = () => {
    console.log('Login successful!');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AnimatedBackground variant="combined" intensity="medium" />
      
      <Container maxWidth="sm">
        <GlassmorphicCard>
          <ModernLoginForm
            onSwitchToRegister={handleSwitchToRegister}
            onLoginSuccess={handleLoginSuccess}
          />
        </GlassmorphicCard>
      </Container>
    </Box>
  );
};

/**
 * Example: ModernLoginForm with initial email
 */
export const WithInitialEmailExample = () => {
  const handleSwitchToRegister = () => {
    console.log('Switch to register form');
  };

  const handleLoginSuccess = () => {
    console.log('Login successful!');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AnimatedBackground variant="gradient" intensity="low" />
      
      <Container maxWidth="sm">
        <GlassmorphicCard>
          <ModernLoginForm
            onSwitchToRegister={handleSwitchToRegister}
            onLoginSuccess={handleLoginSuccess}
            initialEmail="user@example.com"
          />
        </GlassmorphicCard>
      </Container>
    </Box>
  );
};

/**
 * Example: ModernLoginForm with particles background
 */
export const WithParticlesExample = () => {
  const handleSwitchToRegister = () => {
    console.log('Switch to register form');
  };

  const handleLoginSuccess = () => {
    console.log('Login successful!');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <AnimatedBackground variant="particles" intensity="high" particleCount={100} />
      
      <Container maxWidth="sm">
        <GlassmorphicCard blur={30} opacity={0.8}>
          <ModernLoginForm
            onSwitchToRegister={handleSwitchToRegister}
            onLoginSuccess={handleLoginSuccess}
          />
        </GlassmorphicCard>
      </Container>
    </Box>
  );
};

export default BasicExample;
