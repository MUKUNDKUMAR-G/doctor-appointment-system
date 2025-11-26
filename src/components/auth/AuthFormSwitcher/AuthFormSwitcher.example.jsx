/**
 * AuthFormSwitcher Example
 * 
 * Demonstrates usage of the AuthFormSwitcher component
 */

import { Box, Container } from '@mui/material';
import AuthFormSwitcher from './AuthFormSwitcher';
import AnimatedBackground from '../AnimatedBackground';
import GlassmorphicCard from '../GlassmorphicCard';

/**
 * Basic example with login as initial mode
 */
export const BasicExample = () => {
  const handleLoginSuccess = () => {
    console.log('Login successful!');
    alert('Login successful! Redirecting to dashboard...');
  };

  const handleRegisterSuccess = () => {
    console.log('Registration successful!');
    alert('Registration successful! Redirecting to dashboard...');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <AnimatedBackground variant="combined" />
      <Container maxWidth="sm">
        <GlassmorphicCard>
          <AuthFormSwitcher
            initialMode="login"
            onLoginSuccess={handleLoginSuccess}
            onRegisterSuccess={handleRegisterSuccess}
          />
        </GlassmorphicCard>
      </Container>
    </Box>
  );
};

/**
 * Example starting with register mode
 */
export const RegisterFirstExample = () => {
  const handleLoginSuccess = () => {
    console.log('Login successful!');
  };

  const handleRegisterSuccess = () => {
    console.log('Registration successful!');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <AnimatedBackground variant="gradient" />
      <Container maxWidth="sm">
        <GlassmorphicCard>
          <AuthFormSwitcher
            initialMode="register"
            onLoginSuccess={handleLoginSuccess}
            onRegisterSuccess={handleRegisterSuccess}
          />
        </GlassmorphicCard>
      </Container>
    </Box>
  );
};

/**
 * Example with custom background
 */
export const CustomBackgroundExample = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <AnimatedBackground
        variant="particles"
        intensity="high"
        particleCount={100}
        colors={['#667eea', '#764ba2', '#f093fb', '#4facfe']}
      />
      <Container maxWidth="sm">
        <GlassmorphicCard blur={30} opacity={0.8}>
          <AuthFormSwitcher
            initialMode="login"
            onLoginSuccess={() => console.log('Login success')}
            onRegisterSuccess={() => console.log('Register success')}
          />
        </GlassmorphicCard>
      </Container>
    </Box>
  );
};

export default BasicExample;
