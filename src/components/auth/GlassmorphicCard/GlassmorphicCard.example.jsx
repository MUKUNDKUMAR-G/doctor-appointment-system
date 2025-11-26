import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import GlassmorphicCard from './GlassmorphicCard';

/**
 * Example usage of GlassmorphicCard component
 * This file demonstrates various configurations and use cases
 */

// Example 1: Basic usage with default props
export const BasicExample = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}
  >
    <GlassmorphicCard>
      <Typography variant="h4" gutterBottom>
        Welcome Back
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Sign in to continue to your account
      </Typography>
    </GlassmorphicCard>
  </Box>
);

// Example 2: Login form with custom styling
export const LoginFormExample = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}
  >
    <GlassmorphicCard blur={25} opacity={0.8} elevation={4}>
      <Typography variant="h4" gutterBottom align="center">
        Sign In
      </Typography>
      <Box component="form" sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          variant="outlined"
        />
        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3 }}
        >
          Sign In
        </Button>
      </Box>
    </GlassmorphicCard>
  </Box>
);

// Example 3: Wide card with custom dimensions
export const WideCardExample = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    }}
  >
    <GlassmorphicCard maxWidth={800} padding={6} borderRadius={24}>
      <Typography variant="h3" gutterBottom>
        Create Account
      </Typography>
      <Typography variant="body1" paragraph>
        Join thousands of healthcare professionals using our platform
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 3 }}>
        <TextField label="First Name" variant="outlined" />
        <TextField label="Last Name" variant="outlined" />
        <TextField label="Email" type="email" variant="outlined" />
        <TextField label="Phone" type="tel" variant="outlined" />
      </Box>
    </GlassmorphicCard>
  </Box>
);

// Example 4: High elevation with intense blur
export const IntenseBlurExample = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    }}
  >
    <GlassmorphicCard blur={40} opacity={0.6} elevation={5}>
      <Typography variant="h4" gutterBottom>
        Premium Card
      </Typography>
      <Typography variant="body1">
        This card has intense blur and high elevation for a dramatic effect
      </Typography>
    </GlassmorphicCard>
  </Box>
);

// Example 5: Compact card with minimal styling
export const CompactExample = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    }}
  >
    <GlassmorphicCard
      maxWidth={320}
      padding={3}
      borderRadius={12}
      blur={15}
      opacity={0.75}
      elevation={2}
    >
      <Typography variant="h6" gutterBottom>
        Quick Action
      </Typography>
      <Button fullWidth variant="contained">
        Get Started
      </Button>
    </GlassmorphicCard>
  </Box>
);

export default {
  BasicExample,
  LoginFormExample,
  WideCardExample,
  IntenseBlurExample,
  CompactExample,
};
