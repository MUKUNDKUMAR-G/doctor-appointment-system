import { lazy, Suspense } from 'react';
import { Dialog, DialogContent, CircularProgress, Box } from '@mui/material';

// Lazy load the AppointmentBooking component
const AppointmentBooking = lazy(() => import('./AppointmentBooking'));

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
const LazyAppointmentBooking = (props) => {
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
      <AppointmentBooking open={open} {...restProps} />
    </Suspense>
  );
};

export default LazyAppointmentBooking;
