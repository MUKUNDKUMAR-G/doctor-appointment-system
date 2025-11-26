import { Box, Skeleton } from '@mui/material';

const AppointmentCardSkeleton = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        p: 3,
        pl: 4,
      }}
    >
      {/* Left border */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
        }}
      >
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>

      {/* Header */}
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={2} flex={1}>
          <Skeleton variant="circular" width={56} height={56} />
          
          <Box flex={1}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="rounded" width={120} height={24} sx={{ mt: 1 }} />
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Skeleton variant="rounded" width={80} height={24} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </Box>

      {/* Date and Time */}
      <Box display="flex" gap={3} mb={2}>
        <Skeleton variant="text" width={120} height={20} />
        <Skeleton variant="text" width={100} height={20} />
      </Box>

      {/* Details button */}
      <Skeleton variant="rounded" width={100} height={32} />
    </Box>
  );
};

export default AppointmentCardSkeleton;
