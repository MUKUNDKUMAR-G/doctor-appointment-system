import { Alert, Snackbar, Stack } from '@mui/material';
import { useError } from '../contexts/ErrorContext';

const GlobalNotifications = () => {
  const { errors, removeError } = useError();

  const handleClose = (errorId) => {
    removeError(errorId);
  };

  return (
    <Stack
      spacing={1}
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: 400,
      }}
    >
      {errors.map((error) => (
        <Snackbar
          key={error.id}
          open={true}
          autoHideDuration={error.persistent ? null : error.duration}
          onClose={() => handleClose(error.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => handleClose(error.id)}
            severity={error.type}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {error.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default GlobalNotifications;