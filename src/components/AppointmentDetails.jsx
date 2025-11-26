import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Grid,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Person,
  CalendarToday,
  AccessTime,
  LocationOn,
  Notes,
  Edit,
  Cancel,
  Close,
  Phone,
  Email,
  School,
} from '@mui/icons-material';
import { format, parseISO, isAfter, addHours, isBefore } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { dateUtils } from '../utils/dateUtils';
import { APPOINTMENT_STATUS } from '../utils/constants';
import AvailabilityCalendar from './AvailabilityCalendar';

const AppointmentDetails = ({ 
  appointmentId, 
  appointment: initialAppointment,
  open, 
  onClose, 
  onAppointmentUpdate 
}) => {
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(initialAppointment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [selectedNewSlot, setSelectedNewSlot] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Update appointment when initialAppointment changes
  useEffect(() => {
    if (initialAppointment) {
      setAppointment(initialAppointment);
      setEditedNotes(initialAppointment.notes || '');
      setLoading(false);
    } else if (appointmentId && !initialAppointment) {
      // Fetch appointment details if not provided
      const fetchAppointmentDetails = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const appointments = await appointmentService.getPatientAppointments(user.id);
          const foundAppointment = appointments.find(apt => apt.id === appointmentId);
          
          if (!foundAppointment) {
            throw new Error('Appointment not found');
          }
          
          setAppointment(foundAppointment);
          setEditedNotes(foundAppointment.notes || '');
        } catch (err) {
          setError(err.message || 'Failed to fetch appointment details');
        } finally {
          setLoading(false);
        }
      };

      fetchAppointmentDetails();
    }
  }, [appointmentId, initialAppointment, user.id]);

  // Initialize edited notes when appointment changes
  useEffect(() => {
    if (appointment) {
      setEditedNotes(appointment.notes || '');
    }
  }, [appointment]);

  // Handle save notes
  const handleSaveNotes = async () => {
    try {
      setActionLoading(true);
      
      const updatedAppointment = await appointmentService.updateAppointment(
        appointment.id, 
        { notes: editedNotes.trim() }
      );
      
      setAppointment(updatedAppointment);
      setEditMode(false);
      
      if (onAppointmentUpdate) {
        onAppointmentUpdate(updatedAppointment);
      }
    } catch (err) {
      setError(err.message || 'Failed to update appointment notes');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reschedule appointment
  const handleReschedule = async () => {
    if (!selectedNewSlot) {
      setError('Please select a new time slot');
      return;
    }

    if (!appointment || !appointment.id) {
      setError('Appointment information is missing');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      
      // Format the date-time properly for the backend
      const newDateTime = `${selectedNewSlot.date}T${selectedNewSlot.slot.time}`;
      
      console.log('Rescheduling appointment:', {
        appointmentId: appointment.id,
        newDateTime,
        selectedSlot: selectedNewSlot
      });
      
      const updatedAppointment = await appointmentService.rescheduleAppointment(
        appointment.id,
        {
          newAppointmentDateTime: newDateTime,
          reason: 'Patient requested reschedule',
        }
      );
      
      setAppointment(updatedAppointment);
      setRescheduleMode(false);
      setSelectedNewSlot(null);
      
      if (onAppointmentUpdate) {
        onAppointmentUpdate(updatedAppointment);
      }
    } catch (err) {
      console.error('Reschedule error:', err);
      setError(err.message || 'Failed to reschedule appointment');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle cancel appointment
  const handleCancel = async () => {
    try {
      setActionLoading(true);
      
      // Check if appointment can be cancelled (24 hours in advance)
      const appointmentDate = parseISO(appointment.appointmentDateTime);
      const now = new Date();
      const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilAppointment < 24) {
        throw new Error('Appointments can only be cancelled at least 24 hours in advance');
      }

      await appointmentService.cancelAppointment(appointment.id);
      
      // Update local state
      setAppointment(prev => ({ ...prev, status: APPOINTMENT_STATUS.CANCELLED }));
      
      if (onAppointmentUpdate) {
        onAppointmentUpdate({ ...appointment, status: APPOINTMENT_STATUS.CANCELLED });
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel appointment');
    } finally {
      setActionLoading(false);
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

  // Check if appointment can be modified
  const canModifyAppointment = () => {
    if (!appointment || appointment.status !== APPOINTMENT_STATUS.SCHEDULED) return false;
    
    const appointmentDate = parseISO(appointment.appointmentDateTime);
    const now = new Date();
    
    return isAfter(appointmentDate, addHours(now, 2));
  };

  // Check if appointment can be cancelled
  const canCancelAppointment = () => {
    if (!appointment || appointment.status !== APPOINTMENT_STATUS.SCHEDULED) return false;
    
    const appointmentDate = parseISO(appointment.appointmentDateTime);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilAppointment >= 24;
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!appointment) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Alert severity="error">
            Appointment not found
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const appointmentDate = parseISO(appointment.appointmentDateTime);
  const doctorName = appointment.doctorName 
    ? `Dr. ${appointment.doctorName}`
    : 'Unknown Doctor';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">
            Appointment Details
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {rescheduleMode ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select New Time Slot
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose a new time for your appointment with {doctorName}
            </Typography>
            
            <AvailabilityCalendar
              doctorId={appointment.doctorId}
              onSlotSelect={setSelectedNewSlot}
              selectedSlot={selectedNewSlot}
            />
          </Box>
        ) : (
          <Box>
            {/* Status */}
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Typography variant="h6">Status:</Typography>
              <Chip 
                label={appointment.status} 
                color={getStatusColor(appointment.status)}
                size="medium"
              />
            </Box>

            {/* Doctor Information */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Doctor Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {doctorName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.doctorSpecialty}
                      </Typography>
                    </Box>
                  </Box>

                </Grid>
              </Grid>
            </Paper>

            {/* Appointment Information */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Appointment Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CalendarToday sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Date
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {dateUtils.formatDate(appointmentDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <AccessTime sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Time
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {dateUtils.formatTime(appointmentDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Appointment ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    #{appointment.id}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Notes Section */}
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">
                  Notes
                </Typography>
                {canModifyAppointment() && !editMode && (
                  <Button
                    startIcon={<Edit />}
                    onClick={() => setEditMode(true)}
                    size="small"
                  >
                    Edit
                  </Button>
                )}
              </Box>

              {editMode ? (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Add notes about your symptoms or reason for visit..."
                    variant="outlined"
                  />
                  <Box display="flex" gap={1} mt={2}>
                    <Button
                      variant="contained"
                      onClick={handleSaveNotes}
                      disabled={actionLoading}
                    >
                      {actionLoading ? <CircularProgress size={20} /> : 'Save'}
                    </Button>
                    <Button onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  {appointment.notes ? (
                    <Typography variant="body1">
                      {appointment.notes}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      No notes added
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        {rescheduleMode ? (
          <>
            <Button onClick={() => setRescheduleMode(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleReschedule}
              disabled={!selectedNewSlot || actionLoading}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Confirm Reschedule'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose}>
              Close
            </Button>
            
            {canModifyAppointment() && (
              <Button
                startIcon={<Edit />}
                onClick={() => setRescheduleMode(true)}
              >
                Reschedule
              </Button>
            )}
            
            {canCancelAppointment() && (
              <Button
                startIcon={<Cancel />}
                color="error"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                {actionLoading ? <CircularProgress size={20} /> : 'Cancel Appointment'}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDetails;