import { Box, Container, Grid, Skeleton, Paper } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Doctor list page skeleton loader
 */
const DoctorListSkeleton = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Search Filter Skeleton */}
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{ p: 3, mb: 4 }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
          </Grid>
        </Grid>
      </Paper>

      {/* Doctor Cards Grid Skeleton */}
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
            <Paper
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item * 0.1 }}
              sx={{ p: 3, height: 400 }}
            >
              {/* Doctor Header */}
              <Box display="flex" gap={2} mb={2}>
                <Skeleton variant="circular" width={80} height={80} />
                <Box flex={1}>
                  <Skeleton variant="text" width="80%" height={28} />
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="50%" height={20} />
                </Box>
              </Box>

              {/* Doctor Details */}
              <Box sx={{ mt: 3 }}>
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2 }} />
                
                {/* Availability Badge */}
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1, mb: 2 }} />
              </Box>

              {/* Action Button */}
              <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1, mt: 'auto' }} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DoctorListSkeleton;
