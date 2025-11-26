import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';
import { useLoading } from '../contexts/LoadingContext';

const GlobalLoading = () => {
  const { isAnyLoading } = useLoading();

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      open={isAnyLoading()}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6" component="div">
          Loading...
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default GlobalLoading;