import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Collapse,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Phone,
  Video,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Circle,
} from 'lucide-react';
import ModernCard from '../ModernCard';
import AnimatedButton from '../AnimatedButton';
import { colors } from '../../../theme/colors';
import { animations } from '../../../theme/animations';

const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingLeft: theme.spacing(4),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '15px',
    top: 0,
    bottom: 0,
    width: '2px',
    background: theme.palette.grey[200],
  },
}));

const TimelineDot = styled(Box)(({ theme, status }) => {
  const statusColors = {
    SCHEDULED: colors.primary.main,
    COMPLETED: colors.success.main,
    CANCELLED: colors.error.main,
    RESCHEDULED: colors.warning.main,
  };

  return {
    position: 'absolute',
    left: '7px',
    top: theme.spacing(2),
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: statusColors[status] || colors.primary.main,
    border: `3px solid ${theme.palette.background.paper}`,
    boxShadow: `0 0 0 2px ${statusColors[status] || colors.primary.main}40`,
    zIndex: 1,
  };
});

const AppointmentCard = styled(ModernCard)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  marginLeft: theme.spacing(2),
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
  },
  transition: `background-color ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
}));

const DoctorInfo = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const StatusChip = styled(Chip)(({ status }) => {
  const statusConfig = {
    SCHEDULED: {
      bg: colors.primary[50],
      color: colors.primary.main,
    },
    COMPLETED: {
      bg: colors.success[50],
      color: colors.success.main,
    },
    CANCELLED: {
      bg: colors.error[50],
      color: colors.error.main,
    },
    RESCHEDULED: {
      bg: colors.warning[50],
      color: colors.warning.main,
    },
  };

  const config = statusConfig[status] || statusConfig.SCHEDULED;

  return {
    backgroundColor: config.bg,
    color: config.color,
    fontWeight: 600,
    fontSize: '0.75rem',
    height: '24px',
  };
});

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  '& svg': {
    width: 16,
    height: 16,
  },
}));

const DetailsSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 2, 2, 2),
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  flexWrap: 'wrap',
}));

const TimelineAppointment = ({
  appointment,
  onAction,
  expandable = true,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const {
    id,
    doctorName,
    doctorSpecialty,
    doctorAvatar,
    appointmentDateTime,
    status = 'SCHEDULED',
    reason,
    notes,
    location,
    type = 'in-person',
  } = appointment;

  const handleToggle = () => {
    if (expandable) {
      setExpanded(!expanded);
    }
  };

  const handleAction = (actionType) => {
    if (onAction) {
      onAction(actionType, appointment);
    }
  };

  const formatDate = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusIcon = (status) => {
    const iconProps = { size: 14, style: { marginRight: '4px' } };
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle {...iconProps} />;
      case 'CANCELLED':
        return <XCircle {...iconProps} />;
      case 'RESCHEDULED':
        return <AlertCircle {...iconProps} />;
      default:
        return <Circle {...iconProps} />;
    }
  };

  return (
    <TimelineContainer>
      <TimelineDot status={status} />
      <AppointmentCard
        variant="outlined"
        hover={expandable}
        component={motion.div}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <HeaderSection onClick={handleToggle}>
          <Avatar
            src={doctorAvatar}
            alt={doctorName}
            sx={{ width: 56, height: 56 }}
          >
            {doctorName?.charAt(0)}
          </Avatar>

          <DoctorInfo>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {doctorName}
              </Typography>
              <StatusChip 
                icon={getStatusIcon(status)}
                label={status} 
                size="small" 
                status={status} 
              />
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {doctorSpecialty}
            </Typography>

            <InfoRow>
              <Calendar />
              <span>{formatDate(appointmentDateTime)}</span>
              <Clock />
              <span>{formatTime(appointmentDateTime)}</span>
            </InfoRow>

            {location && (
              <InfoRow>
                <MapPin />
                <span>{location}</span>
              </InfoRow>
            )}
          </DoctorInfo>

          {expandable && (
            <IconButton size="small">
              {expanded ? <ChevronUp /> : <ChevronDown />}
            </IconButton>
          )}
        </HeaderSection>

        <AnimatePresence>
          {expanded && (
            <Collapse in={expanded} timeout="auto">
              <DetailsSection
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Divider sx={{ mb: 2 }} />

                {reason && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Reason for Visit
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {reason}
                    </Typography>
                  </Box>
                )}

                {notes && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      Notes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {notes}
                    </Typography>
                  </Box>
                )}

                <ActionButtons>
                  {status === 'SCHEDULED' && (
                    <>
                      {type === 'video' && (
                        <AnimatedButton
                          variant="contained"
                          color="primary"
                          size="small"
                          icon={<Video size={16} />}
                          onClick={() => handleAction('join')}
                        >
                          Join Call
                        </AnimatedButton>
                      )}
                      <AnimatedButton
                        variant="outlined"
                        size="small"
                        icon={<Phone size={16} />}
                        onClick={() => handleAction('call')}
                      >
                        Call
                      </AnimatedButton>
                      <AnimatedButton
                        variant="outlined"
                        size="small"
                        icon={<MessageSquare size={16} />}
                        onClick={() => handleAction('message')}
                      >
                        Message
                      </AnimatedButton>
                      <AnimatedButton
                        variant="outlined"
                        size="small"
                        onClick={() => handleAction('reschedule')}
                      >
                        Reschedule
                      </AnimatedButton>
                      <AnimatedButton
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleAction('cancel')}
                      >
                        Cancel
                      </AnimatedButton>
                    </>
                  )}
                  {status === 'COMPLETED' && (
                    <AnimatedButton
                      variant="outlined"
                      size="small"
                      onClick={() => handleAction('viewDetails')}
                    >
                      View Details
                    </AnimatedButton>
                  )}
                </ActionButtons>
              </DetailsSection>
            </Collapse>
          )}
        </AnimatePresence>
      </AppointmentCard>
    </TimelineContainer>
  );
};

export default TimelineAppointment;
