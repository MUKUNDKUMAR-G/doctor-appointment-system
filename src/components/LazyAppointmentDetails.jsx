import { lazy, Suspense } from 'react';
import { Dialog, DialogContent, CircularProgress, Box } from '@mui/material';

// Lazy load the AppointmentDetails component
const AppointmentDetails = lazy(() => import('./AppointmentDetails'));

// Loading fallback for the dialog
const DialogLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
    }}
  >
    <CircularProgress size={48} />
  </Box>
);

// Wrapper component that handles lazy loading
const LazyAppointmentDetails = (props) => {
  const { open, ...restProps } = props;

  // Don't render anything if dialog is not open
  if (!open) {
    return null;
  }

  return (
    <Suspense fallback={
      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogContent>
          <DialogLoader />
        </DialogContent>
      </Dialog>
    }>
      <AppointmentDetails open={open} {...restProps} />
    </Suspense>
  );
};

export default LazyAppointmentDetails;
