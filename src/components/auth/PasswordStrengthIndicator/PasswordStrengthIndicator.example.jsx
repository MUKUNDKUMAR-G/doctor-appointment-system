/**
 * PasswordStrengthIndicator Component Example
 * 
 * This file demonstrates how to use the PasswordStrengthIndicator component
 * in your authentication forms.
 */

import React, { useState } from 'react';
import { Box, Container, Typography, TextField } from '@mui/material';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

/**
 * Example usage of PasswordStrengthIndicator
 */
const PasswordStrengthIndicatorExample = () => {
  const [password, setPassword] = useState('');

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Password Strength Indicator Example
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a password to see strength indicator"
        />
        
        <PasswordStrengthIndicator 
          password={password}
          showRequirements={true}
        />
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Try these passwords:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Weak: "abc" (only lowercase)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Medium: "Abc123" (lowercase, uppercase, numbers)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Strong: "Abc123!@" (all requirements met)
        </Typography>
      </Box>
    </Container>
  );
};

export default PasswordStrengthIndicatorExample;
