import { useState, memo } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem,
  Collapse,
  Divider,
  Button,
  CircularProgress,
  Fade
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Person,
  CalendarToday,
  AccessTime,
  MoreVert,
  ExpandMore,
  ExpandLess,
  Edit,
  Cancel,
  Visibility,
  Notes as NotesIcon,
  LocalHospital
} from '@mui/icons-material';
import { parseISO } from 'date-fns';
import { dateUtils } from '../../../utils/dateUtils';
import { APPOINTMENT_STATUS } from '../../../utils/constants';

const AppointmentCard = memo(({ 
  appointment, 
  onViewDetails, 
  onReschedule, 
  onCancel,
  canModify = false,
  canCancel = false,
  loading = false
}) => {
  const [expanded, setExpanded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const appointmentDate = parseISO(appointment.appointmentDateTime);
  const doctorName = appointment.doctorName ? `Dr. ${appointment.doctorName}` : 'Unknown Doctor';

  // Get status color and border color
  const getStatusConfig = (status) => {
    switch (status) {
      case APPOINTMENT_STATUS.SCHEDULED:
        return { 
          color: 'primary', 
          borderColor: '#2563EB',
          bgColor: 'rgba(37, 99, 235, 0.04)'
        };
      case APPOINTMENT_STATUS.COMPLETED:
        return { 
          color: 'success', 
          borderColor: '#10B981',
          bgColor: 'rgba(16, 185, 129, 0.04)'
        };
      case APPOINTMENT_STATUS.CANCELLED:
        return { 
          color: 'error', 
          borderColor: '#EF4444',
          bgColor: 'rgba(239, 68, 68, 0.04)'
        };
      case APPOINTMENT_STATUS.RESCHEDULED:
        return { 
          color: 'warning', 
          borderColor: '#F59E0B',
          bgColor: 'rgba(245, 158, 11, 0.04)'
        };
      default:
        return { 
          color: 'default', 
          borderColor: '#D1D5DB',
          bgColor: 'rgba(209, 213, 219, 0.04)'
        };
    }
  };

  const statusConfig = getStatusConfig(appointment.status);

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleActionWithLoading = async (action) => {
    setActionLoading(true);
    try {
      await action();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Box
        sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            '& .action-menu-button': {
              opacity: 1,
            },
          },
        }}
      >
        {/* Left border color indicator */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            bgcolor: statusConfig.borderColor,
          }}
        />

        <Box sx={{ p: 3, pl: 4 }}>
          {/* Header */}
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2} flex={1}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: statusConfig.bgColor,
                  color: statusConfig.borderColor,
                  border: `2px solid ${statusConfig.borderColor}`,
                }}
              >
                <Person sx={{ fontSize: 28 }} />
              </Avatar>

              <Box flex={1}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {doctorName}
                </Typography>
                
                {appointment.doctorSpecialty && (
                  <Chip
                    icon={<LocalHospital sx={{ fontSize: 16 }} />}
                    label={appointment.doctorSpecialty}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      bgcolor: statusConfig.bgColor,
                      color: statusConfig.borderColor,
                      border: `1px solid ${statusConfig.borderColor}`,
                      '& .MuiChip-icon': {
                        color: statusConfig.borderColor,
                      },
                    }}
                  />
                )}
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={appointment.status}
                color={statusConfig.color}
                size="small"
                sx={{ fontWeight: 500 }}
              />
              
              {(loading || actionLoading) ? (
                <CircularProgress size={20} />
              ) : (
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  className="action-menu-button"
                  sx={{
                    opacity: 0.7,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      opacity: 1,
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <MoreVert />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Date and Time */}
          <Box display="flex" gap={3} mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {dateUtils.formatDate(appointmentDate)}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {dateUtils.formatTime(appointmentDate)}
              </Typography>
            </Box>
          </Box>

          {/* Expandable Details Section */}
          {appointment.notes && (
            <>
              <Button
                size="small"
                endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                sx={{
                  textTransform: 'none',
                  color: 'text.secondary',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                {expanded ? 'Hide' : 'Show'} Details
              </Button>

              <Collapse 
                in={expanded}
                timeout={300}
                sx={{
                  '& .MuiCollapse-wrapperInner': {
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                }}
              >
                <Divider sx={{ my: 2 }} />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Box display="flex" gap={1} alignItems="flex-start">
                    <NotesIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Notes
                      </Typography>
                      <Typography variant="body2">
                        {appointment.notes}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Collapse>
            </>
          )}
        </Box>

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          TransitionComponent={Fade}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              minWidth: 180,
            },
            '& .MuiMenuItem-root': {
              py: 1.5,
              px: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'translateX(4px)',
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleActionWithLoading(() => onViewDetails(appointment));
              handleMenuClose();
            }}
            disabled={actionLoading}
          >
            <Visibility sx={{ mr: 1, fontSize: 20 }} />
            View Details
          </MenuItem>

          {canModify && (
            <MenuItem
              onClick={() => {
                handleActionWithLoading(() => onReschedule(appointment));
                handleMenuClose();
              }}
              disabled={actionLoading}
            >
              <Edit sx={{ mr: 1, fontSize: 20 }} />
              Reschedule
            </MenuItem>
          )}

          {canCancel && (
            <MenuItem
              onClick={() => {
                handleActionWithLoading(() => onCancel(appointment));
                handleMenuClose();
              }}
              disabled={actionLoading}
              sx={{ 
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'error.lighter',
                },
              }}
            >
              <Cancel sx={{ mr: 1, fontSize: 20 }} />
              Cancel Appointment
            </MenuItem>
          )}
        </Menu>
      </Box>
    </motion.div>
  );
});

AppointmentCard.displayName = 'AppointmentCard';

export default AppointmentCard;
