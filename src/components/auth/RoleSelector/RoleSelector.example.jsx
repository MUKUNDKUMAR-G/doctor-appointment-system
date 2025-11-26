import React, { useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import RoleSelector from './RoleSelector';

/**
 * Example usage of RoleSelector component
 * Demonstrates role selection with visual feedback and theming
 */
const RoleSelectorExample = () => {
  const [selectedRole, setSelectedRole] = useState('PATIENT');

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          RoleSelector Component Example
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Select a role to see the visual feedback and color theming in action.
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Selected Role: {selectedRole}
        </Typography>
        <RoleSelector value={selectedRole} onChange={setSelectedRole} />
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Features Demonstrated:
        </Typography>
        <ul>
          <li>Visual icons for each role (Patient, Doctor, Admin)</li>
          <li>Role-specific color theming</li>
          <li>Smooth color transition animations on selection</li>
          <li>Hover and focus states with elevation changes</li>
          <li>Responsive layout (column on mobile, row on desktop)</li>
          <li>Accessibility features (ARIA labels, keyboard navigation)</li>
          <li>Selection indicator with checkmark animation</li>
        </ul>
      </Box>
    </Container>
  );
};

export default RoleSelectorExample;
