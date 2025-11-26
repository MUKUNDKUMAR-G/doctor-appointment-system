// Spacing system for the Healthcare Appointment System
// Base unit: 8px
export const spacing = {
  0: '0px',
  0.5: '4px',
  1: '8px',
  1.5: '12px',
  2: '16px',
  2.5: '20px',
  3: '24px',
  4: '32px',
  5: '40px',
  6: '48px',
  8: '64px',
  10: '80px',
  12: '96px',
  16: '128px',
  20: '160px',
  24: '192px',
};

// Helper function to get spacing value
export const getSpacing = (multiplier) => {
  return spacing[multiplier] || `${multiplier * 8}px`;
};
