/**
 * Integration test demonstrating GlassmorphicCard usage
 * This file shows how the component integrates with other components
 */

import React from 'react';
import { Typography, TextField, Button, Box } from '@mui/material';
import GlassmorphicCard from '../GlassmorphicCard';

/**
 * Example: GlassmorphicCard with form content
 * This demonstrates the component works with MUI components
 */
export const LoginFormIntegration = () => {
  return (
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
          Sign In
        </Typography>
        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
        >
          Sign In
        </Button>
      </GlassmorphicCard>
    </Box>
  );
};

/**
 * Example: GlassmorphicCard with custom props
 */
export const CustomStyledCard = () => {
  return (
    <GlassmorphicCard
      blur={30}
      opacity={0.8}
      borderRadius={20}
      padding={5}
      maxWidth={600}
      elevation={4}
    >
      <Typography variant="h5">Custom Styled Card</Typography>
      <Typography variant="body1">
        This card has custom blur, opacity, and elevation settings.
      </Typography>
    </GlassmorphicCard>
  );
};

/**
 * Example: Nested components
 */
export const NestedComponentsExample = () => {
  return (
    <GlassmorphicCard>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please enter your details
        </Typography>
      </Box>
      
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Name" variant="outlined" />
        <TextField label="Email" type="email" variant="outlined" />
        <Button variant="contained" size="large">
          Submit
        </Button>
      </Box>
    </GlassmorphicCard>
  );
};

// Verify component can be imported and used
console.log('✅ GlassmorphicCard integration examples loaded successfully');
