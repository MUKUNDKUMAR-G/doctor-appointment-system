import React from 'react';
import { Grid, Box, Typography, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import ModernCard from '../../common/ModernCard';
import { colors } from '../../../theme/colors';

const GradientIconWrapper = styled(Box)(({ gradient }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 64,
  height: 64,
  borderRadius: '16px',
  background: gradient || colors.gradients.primary,
  marginBottom: '16px',
  '& svg': {
    width: 32,
    height: 32,
    color: '#ffffff',
  },
}));

const ActionCard = styled(ModernCard)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
}));

const AdminQuickActions = ({ actions = [] }) => {
  return (
    <Grid container spacing={3}>
      {actions.map((action, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <ActionCard
            variant="elevated"
            hover
            onClick={action.onClick}
            ariaLabel={`${action.title}: ${action.description}`}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <GradientIconWrapper gradient={action.gradient}>
              {action.icon}
            </GradientIconWrapper>
            
            <Typography
              variant="h6"
              component="h3"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              {action.title}
            </Typography>
            
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.6 }}
            >
              {action.description}
            </Typography>
          </ActionCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default AdminQuickActions;
