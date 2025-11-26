import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Cancel,
  Visibility,
  Person,
  CalendarToday,
  AccessTime,
  Notes,
  Sync,
} from '@mui/icons-material';
import { format, parseISO, isBefore, isAfter, addHours } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { dateUtils } from '../utils/dateUtils';
import { APPOINTMENT_STATUS } from '../utils/constants';
import useAppointments from '../hooks/useAppointments';
import RealTimeStatusIndicator from './RealTimeStatusIndicator';

const AppointmentList = ({ 
  onAppointmentUpdate,
  onAppointmentSelect,
  showPastAppointments = false 
}) => {
  const { user } = useAuth();
  
  // Use the appointments hook for real-time updates
  const {
    appointments: allAppointments,
    loading,
    error,
    cancelAppointment,
    rescheduleAppointment,
    refreshAppointments,
    cancellingAppointment,
  } = useAppointments({ autoRefresh: true });
  
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Filter and sort appointments based on showPastAppointments prop
  const appointments = allAppointments.filter(appointment => {
    const appointmentDate = parseISO(appointment.appointmentDateTime);
    const now = new Date();
    return showPastAppointments ? 
      isBefore(appointmentDate, now) : 
      isAfter(appointmentDate, now) || dateUtils.isToday(appointmentDate);
  }).sort((a, b) => {
    const dateA = parseISO(a.appointmentDateTime);
    const dateB = parseISO(b.appointmentDateTime);
    return showPastAppointments ? 
      dateB.getTime() - dateA.getTime() : // Past: newest first
      dateA.getTime() - dateB.getTime();   // Future: earliest first
  });

  // Handle menu open
  const handleMenuOpen = (event, appointment) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAppointment(appointment);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedAppointment(null);
  };

  // Handle cancel appointment with optimistic updates
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    // Check if appointment can be cancelled (24 hours in advance)
    const appointmentDate = parseISO(selectedAppointment.appointmentDateTime);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilAppointment < 24) {
      setError('Appointments can only be cancelled at least 24 hours in advance');
      return;
    }

    try {
      // Use the hook's cancel function with optimistic updates
      await cancelAppointment(selectedAppointment.id, cancelReason);
      
      // Notify parent component
      if (onAppointmentUpdate) {
        onAppointmentUpdate();
      }

      setCancelDialogOpen(false);
      setCancelReason('');
      handleMenuClose();
    } catch (err) {
      // Error handling is done by the hook
      console.error('Cancel appointment error:', err);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case APPOINTMENT_STATUS.SCHEDULED:
        return 'primary';
      case APPOINTMENT_STATUS.COMPLETED:
        return 'success';
      case APPOINTMENT_STATUS.CANCELLED:
        return 'error';
      case APPOINTMENT_STATUS.RESCHEDULED:
        return 'warning';
      default:
        return 'default';
    }
  };

  // Check if appointment can be cancelled
  const canCancelAppointment = (appointment) => {
    if (appointment.status !== APPOINTMENT_STATUS.SCHEDULED) return false;
    
    const appointmentDate = parseISO(appointment.appointmentDateTime);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilAppointment >= 24;
  };

  // Check if appointment can be modified
  const canModifyAppointment = (appointment) => {
    if (appointment.status !== APPOINTMENT_STATUS.SCHEDULED) return false;
    
    const appointmentDate = parseISO(appointment.appointmentDateTime);
    const now = new Date();
    
    return isAfter(appointmentDate, addHours(now, 2)); // Can modify if more than 2 hours away
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (appointments.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {showPastAppointments ? 'No Past Appointments' : 'No Upcoming Appointments'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {showPastAppointments 
            ? 'You have no appointment history yet.'
            : 'You have no scheduled appointments. Book an appointment with a doctor to get started.'
          }
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header with refresh and status */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {showPastAppointments ? 'Past Appointments' : 'Upcoming Appointments'}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <RealTimeStatusIndicator variant="detailed" />
          <Tooltip title="Refresh appointments">
            <IconButton 
              onClick={refreshAppointments}
              disabled={loading}
              size="small"
            >
              <Sync />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Paper>
        <List>
          {appointments.map((appointment, index) => {
            const appointmentDate = parseISO(appointment.appointmentDateTime);
            const doctorName = appointment.doctorName 
              ? `Dr. ${appointment.doctorName}`
              : 'Unknown Doctor';

            return (
              <Box key={appointment.id}>
                <ListItem
                  sx={{
                    py: 2,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" mr={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                  </Box>

                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {doctorName}
                        </Typography>
                        <Chip 
                          label={appointment.status} 
                          size="small" 
                          color={getStatusColor(appointment.status)}
                        />
                        {appointment.hasRecentUpdate && (
                          <Chip 
                            label="Updated" 
                            size="small" 
                            color="info"
                            variant="outlined"
                            sx={{ 
                              animation: 'pulse 2s ease-in-out',
                              '@keyframes pulse': {
                                '0%': { opacity: 1 },
                                '50%': { opacity: 0.5 },
                                '100%': { opacity: 1 },
                              },
                            }}
                          />
                        )}
                        {appointment.isOptimistic && (
                          <Chip 
                            label="Updating..." 
                            size="small" 
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box component="span">
                        <Box component="span" display="inline-flex" alignItems="center" gap={1} mb={0.5}>
                          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" component="span">
                            {dateUtils.formatDate(appointmentDate)}
                          </Typography>
                        </Box>
                        
                        <Box component="span" display="inline-flex" alignItems="center" gap={1} mb={0.5}>
                          <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" component="span">
                            {dateUtils.formatTime(appointmentDate)}
                          </Typography>
                        </Box>

                        {appointment.doctorSpecialty && (
                          <Typography variant="body2" color="text.secondary" component="span" display="block">
                            {appointment.doctorSpecialty}
                          </Typography>
                        )}

                        {appointment.notes && (
                          <Box component="span" display="inline-flex" alignItems="center" gap={1} mt={1}>
                            <Notes sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary" component="span" noWrap>
                              {appointment.notes}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    <Tooltip title="More actions">
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuOpen(e, appointment)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                
                {index < appointments.length - 1 && <Divider />}
              </Box>
            );
          })}
        </List>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (onAppointmentSelect) {
            onAppointmentSelect(selectedAppointment);
          }
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        
        {selectedAppointment && canModifyAppointment(selectedAppointment) && (
          <MenuItem onClick={() => {
            if (onAppointmentSelect) {
              onAppointmentSelect(selectedAppointment);
            }
            handleMenuClose();
          }}>
            <Edit sx={{ mr: 1 }} />
            Reschedule
          </MenuItem>
        )}
        
        {selectedAppointment && canCancelAppointment(selectedAppointment) && (
          <MenuItem 
            onClick={() => {
              setCancelDialogOpen(true);
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Cancel sx={{ mr: 1 }} />
            Cancel Appointment
          </MenuItem>
        )}
      </Menu>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to cancel this appointment?
          </Typography>
          
          {selectedAppointment && (
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Appointment Details
              </Typography>
              <Typography variant="body2">
                Doctor: {selectedAppointment.doctorName ? `Dr. ${selectedAppointment.doctorName}` : 'Unknown Doctor'}
              </Typography>
              <Typography variant="body2">
                Date: {selectedAppointment.appointmentDateTime && 
                  dateUtils.formatDateTime(selectedAppointment.appointmentDateTime)}
              </Typography>
            </Paper>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for cancellation (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Please provide a reason for cancelling this appointment..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Keep Appointment
          </Button>
          <Button 
            onClick={handleCancelAppointment}
            color="error"
            variant="contained"
            disabled={cancellingAppointment}
          >
            {cancellingAppointment ? <CircularProgress size={20} /> : 'Cancel Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentList;