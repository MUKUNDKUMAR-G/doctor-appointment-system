import { Box, Container, Skeleton, Paper } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Appointment list page skeleton loader
 */
const AppointmentListSkeleton = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Page Header Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width="40%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="30%" height={24} />
      </Box>

      {/* Tabs Skeleton */}
      <Box display="flex" gap={2} sx={{ mb: 3 }}>
        <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Appointment Cards Skeleton */}
      {[1, 2, 3, 4].map((item) => (
        <Paper
          key={item}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: item * 0.1 }}
          sx={{ p: 3, mb: 2 }}
        >
          <Box display="flex" gap={2}>
            <Skeleton variant="circular" width={56} height={56} />
            <Box flex={1}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Skeleton variant="text" width="40%" height={28} />
                <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
              </Box>
              <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
              <Box display="flex" gap={3}>
                <Skeleton variant="text" width="25%" height={20} />
                <Skeleton variant="text" width="25%" height={20} />
              </Box>
            </Box>
          </Box>
        </Paper>
      ))}
    </Container>
  );
};

export default AppointmentListSkeleton;
