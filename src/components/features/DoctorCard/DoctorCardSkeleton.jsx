import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Skeleton,
  Divider,
  Stack,
} from '@mui/material';

const DoctorCardSkeleton = () => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Doctor Header */}
        <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
          <Skeleton variant="circular" width={80} height={80} />

          <Box flexGrow={1}>
            <Skeleton variant="text" width="70%" height={32} />
            <Skeleton variant="rounded" width={100} height={24} sx={{ mt: 0.5 }} />
            <Box display="flex" alignItems="center" gap={0.5} mt={1}>
              <Skeleton variant="rounded" width={100} height={20} />
              <Skeleton variant="text" width={40} height={20} />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Doctor Details */}
        <Stack spacing={1.5}>
          {[1, 2, 3, 4].map((item) => (
            <Box key={item} display="flex" alignItems="center" gap={1}>
              <Skeleton variant="circular" width={20} height={20} />
              <Box flexGrow={1}>
                <Skeleton variant="text" width="40%" height={16} />
                <Skeleton variant="text" width="60%" height={20} />
              </Box>
            </Box>
          ))}

          {/* Availability Box */}
          <Skeleton variant="rounded" width="100%" height={50} sx={{ mt: 1, borderRadius: 1.5 }} />
        </Stack>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Skeleton variant="rounded" width="100%" height={42} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rounded" width={80} height={42} sx={{ borderRadius: 1 }} />
      </CardActions>
    </Card>
  );
};

export default DoctorCardSkeleton;
