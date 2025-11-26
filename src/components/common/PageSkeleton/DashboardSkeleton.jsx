import { Box, Container, Grid, Skeleton, Paper } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Dashboard page skeleton loader
 */
const DashboardSkeleton = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Header Skeleton */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{ mb: 4 }}
      >
        <Skeleton variant="text" width="40%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="30%" height={24} />
      </Box>

      {/* Stats Cards Skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item * 0.1 }}
              sx={{ p: 3, height: 140 }}
            >
              <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" height={20} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Skeleton */}
      <Grid container spacing={3}>
        {/* Appointments Timeline Skeleton */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
            {[1, 2, 3].map((item) => (
              <Box key={item} sx={{ mb: 3 }}>
                <Box display="flex" gap={2} mb={2}>
                  <Skeleton variant="circular" width={56} height={56} />
                  <Box flex={1}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                </Box>
                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Quick Actions Skeleton */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Skeleton variant="text" width="60%" height={32} sx={{ mb: 3 }} />
            {[1, 2, 3, 4].map((item) => (
              <Skeleton
                key={item}
                variant="rectangular"
                height={80}
                sx={{ mb: 2, borderRadius: 2 }}
              />
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardSkeleton;
