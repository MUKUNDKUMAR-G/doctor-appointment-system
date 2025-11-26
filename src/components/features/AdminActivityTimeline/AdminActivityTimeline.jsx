import React from 'react';
import { Box, Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  EventAvailable,
  CheckCircle,
  Cancel,
  CalendarToday,
  PersonAdd,
  Edit,
  Delete,
  Warning,
} from '@mui/icons-material';
import ModernCard from '../../common/ModernCard';
import { colors } from '../../../theme/colors';

const TimelineContainer = styled(ModernCard)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const TimelineItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const StatusAvatar = styled(Avatar)(({ statuscolor }) => ({
  backgroundColor: statuscolor || colors.primary.main,
}));

const getActivityIcon = (activity) => {
  const severity = activity.severity || activity.status;
  const action = activity.action || '';
  
  // Check severity first
  if (severity === 'CRITICAL' || severity === 'ERROR') {
    return <Delete />;
  }
  if (severity === 'WARNING') {
    return <Warning />;
  }
  
  // Check action type
  if (action.includes('CREATE') || action.includes('ADD')) {
    return <PersonAdd />;
  }
  if (action.includes('UPDATE') || action.includes('EDIT') || action.includes('MODIFY')) {
    return <Edit />;
  }
  if (action.includes('DELETE') || action.includes('REMOVE')) {
    return <Delete />;
  }
  if (action.includes('VERIFY') || action.includes('APPROVE')) {
    return <CheckCircle />;
  }
  if (action.includes('CANCEL') || action.includes('REJECT')) {
    return <Cancel />;
  }
  
  return <CalendarToday />;
};

const getStatusColor = (activity) => {
  const severity = activity.severity || activity.status;
  
  const colorMap = {
    CRITICAL: colors.error.main,
    ERROR: colors.error.main,
    WARNING: colors.warning.main,
    INFO: colors.info.main,
    SCHEDULED: colors.info.main,
    COMPLETED: colors.success.main,
    CANCELLED: colors.error.main,
    RESCHEDULED: colors.warning.main,
    CREATED: colors.primary.main,
    UPDATED: colors.info.main,
    DELETED: colors.error.main,
  };
  return colorMap[severity] || colors.grey[500];
};

const getChipColor = (activity) => {
  const severity = activity.severity || activity.status;
  
  const colorMap = {
    CRITICAL: 'error',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    SCHEDULED: 'info',
    COMPLETED: 'success',
    CANCELLED: 'error',
    RESCHEDULED: 'warning',
    CREATED: 'primary',
    UPDATED: 'info',
    DELETED: 'error',
  };
  return colorMap[severity] || 'default';
};

const AdminActivityTimeline = ({ activities = [], title = 'Recent Activity' }) => {
  if (activities.length === 0) {
    return (
      <TimelineContainer variant="elevated">
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Box textAlign="center" py={6}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No recent activity to display
          </Typography>
          <Typography variant="body2" color="text.secondary">
            System activity will appear here
          </Typography>
        </Box>
      </TimelineContainer>
    );
  }

  return (
    <TimelineContainer
      variant="elevated"
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      
      <List disablePadding>
        {activities.map((activity, index) => (
          <TimelineItem
            key={activity.id || index}
            component={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ListItemAvatar>
              <StatusAvatar statuscolor={getStatusColor(activity)}>
                {getActivityIcon(activity)}
              </StatusAvatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography variant="body1" component="span">
                    {activity.details || activity.message || activity.action}
                  </Typography>
                  <Chip
                    label={activity.severity || activity.status || 'INFO'}
                    size="small"
                    color={getChipColor(activity)}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              }
              secondary={
                activity.timestamp
                  ? format(parseISO(activity.timestamp), 'MMM dd, yyyy h:mm a')
                  : 'Unknown time'
              }
            />
          </TimelineItem>
        ))}
      </List>
    </TimelineContainer>
  );
};

export default AdminActivityTimeline;
