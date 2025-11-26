import { Box, Container, Grid, Skeleton, Paper } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Profile page skeleton loader
 */
const ProfileSkeleton = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Summary Card Skeleton */}
        <Grid item xs={12} md={4}>
          <Paper
            component={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            sx={{ p: 3, textAlign: 'center' }}
          >
            <Skeleton
              variant="circular"
              width={120}
              height={120}
              sx={{ mx: 'auto', mb: 2 }}
            />
            <Skeleton variant="text" width="70%" height={32} sx={{ mx: 'auto', mb: 1 }} />
            <Skeleton variant="text" width="50%" height={20} sx={{ mx: 'auto', mb: 3 }} />
            
            {/* Stats */}
            <Grid container spacing={2}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={4} key={item}>
                  <Skeleton variant="text" width="100%" height={32} />
                  <Skeleton variant="text" width="100%" height={20} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Profile Details Skeleton */}
        <Grid item xs={12} md={8}>
          <Paper
            component={motion.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            sx={{ p: 3, mb: 3 }}
          >
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} key={item}>
                  <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Account Statistics Skeleton */}
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            sx={{ p: 3 }}
          >
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} sm={4} key={item}>
                  <Box textAlign="center">
                    <Skeleton
                      variant="circular"
                      width={100}
                      height={100}
                      sx={{ mx: 'auto', mb: 2 }}
                    />
                    <Skeleton variant="text" width="80%" height={24} sx={{ mx: 'auto' }} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfileSkeleton;
