import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { colors } from '../../../theme/colors';

const GlassmorphicHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(4, 3),
  borderRadius: theme.shape.borderRadius * 2,
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  marginBottom: theme.spacing(4),
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: colors.gradients.primary,
    opacity: 0.05,
    zIndex: 0,
  },
}));

const ContentWrapper = styled(Box)({
  position: 'relative',
  zIndex: 1,
});

const AdminWelcomeHeader = ({ userName = 'Administrator', subtitle }) => {
  return (
    <GlassmorphicHeader
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ContentWrapper>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: colors.gradients.primary,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome back, {userName}!
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ lineHeight: 1.6 }}
        >
          {subtitle || 'Manage your healthcare system from here. Monitor key metrics and take quick actions.'}
        </Typography>
      </ContentWrapper>
    </GlassmorphicHeader>
  );
};

export default AdminWelcomeHeader;
