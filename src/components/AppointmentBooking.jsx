import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  CalendarToday,
  Person,
  CheckCircle,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { appointmentService } from '../services/appointmentService';
import api from '../services/api';
import AvailabilityCalendar from './AvailabilityCalendar';
import DateTimeSelectionStep from './features/DateTimeSelectionStep/DateTimeSelectionStep';
import ConfirmationStep from './features/ConfirmationStep/ConfirmationStep';
import SuccessStep from './features/SuccessStep/SuccessStep';
import { dateUtils } from '../utils/dateUtils';
import { APPOINTMENT_STATUS } from '../utils/constants';
import useApiCall from '../hooks/useApiCall';

const steps = ['Select Doctor', 'Select Time Slot', 'Confirm Details', 'Booking Complete'];

const AppointmentBooking = ({ 
  doctorId: initialDoctorId, 
  doctorInfo: initialDoctorInfo, 
  open, 
  onClose, 
  onBookingComplete 
}) => {
  const { user } = useAuth();
  const { notifyAppointmentBooked } = useNotification();
  const [doctorId, setDoctorId] = useState(initialDoctorId);
  const [doctorInfo, setDoctorInfo] = useState(initialDoctorInfo);
  const [activeStep, setActiveStep] = useState(initialDoctorId ? 1 : 0); // Start at step 1 if doctor is pre-selected
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availability, setAvailability] = useState({});
  const [reservedSlot, setReservedSlot] = useState(null);
  const [reservationTimer, setReservationTimer] = useState(null);
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [optimisticAppointment, setOptimisticAppointment] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use the API call hook for booking
  const {
    execute: bookAppointment,
    isLoading: bookingLoading,
  } = useApiCall({
    onSuccess: (appointment) => {
      // Clear optimistic state
      setOptimisticAppointment(null);
      
      // Store booking result for display
      setBookingResult(appointment);
      
      // Notify user of successful booking
      notifyAppointmentBooked({
        ...appointment,
        doctorName: doctorInfo?.name || `Dr. ${doctorInfo?.firstName} ${doctorInfo?.lastName}`,
        dateTime: format(new Date(`${selectedSlot.date}T${selectedSlot.slot.time}`), 'MMM dd, yyyy at h:mm a'),
      });
      
      // Notify parent component
      if (onBookingComplete) {
        onBookingComplete(appointment);
      }
      
      // Auto-close dialog after 3 seconds to allow user to see success message
      setTimeout(() => {
        handleClose();
      }, 3000);
    },
    onError: (error) => {
      // Rollback optimistic update
      setOptimisticAppointment(null);
      console.error('Booking failed:', error);
    },
    showSuccessMessage: false, // We handle success notification manually
    loadingKey: 'appointment-booking',
  });

  // State for doctor selection
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  // Sync with prop changes
  useEffect(() => {
    if (initialDoctorId && initialDoctorInfo) {
      setDoctorId(initialDoctorId);
      setDoctorInfo(initialDoctorInfo);
      setActiveStep(1); // Skip doctor selection if doctor is provided
    }
  }, [initialDoctorId, initialDoctorInfo]);

  // Fetch doctors when dialog opens without pre-selected doctor
  useEffect(() => {
    const fetchDoctors = async () => {
      if (open && !initialDoctorId) {
        try {
          setLoadingDoctors(true);
          const response = await api.get('/doctors');
          const data = response.data || [];
          setDoctors(Array.isArray(data) ? data.filter(d => d.isAvailable) : []);
        } catch (err) {
          console.error('Failed to fetch doctors:', err);
          setDoctors([]);
        } finally {
          setLoadingDoctors(false);
        }
      }
    };
    fetchDoctors();
  }, [open, initialDoctorId]);

  // Cleanup reservation timer on unmount
  useEffect(() => {
    return () => {
      if (reservationTimer) {
        clearTimeout(reservationTimer);
      }
    };
  }, [reservationTimer]);

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Clear time when date changes
  };

  // Handle time selection
  const handleTimeSelect = (timeSlot) => {
    setSelectedTime(timeSlot);
  };

  // Fetch availability for a given month
  const handleFetchAvailability = useCallback(async (month) => {
    if (!doctorId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const monthParam = format(month, 'yyyy-MM');
      console.log('Fetching availability for doctor:', doctorId, 'month:', monthParam);
      
      // Fetch availability from API
      const response = await api.get(`/doctors/${doctorId}/availability`, {
        params: {
          month: monthParam,
        }
      });
      
      console.log('Raw API response:', response.data);
      
      // Transform the response data into the format expected by DateTimeSelectionStep
      // Backend returns: List<TimeSlotResponse> with dateTime, startTime, endTime, isAvailable, etc.
      // Frontend expects: { "2025-11-20": [{ time: "09:00", available: true }, ...], ... }
      const timeSlots = response.data || [];
      const availabilityByDate = {};
      
      timeSlots.forEach(slot => {
        // Extract date from dateTime field (format: "2025-11-20T09:00:00")
        const dateTime = new Date(slot.dateTime);
        const dateKey = format(dateTime, 'yyyy-MM-dd');
        const timeStr = format(dateTime, 'HH:mm');
        
        if (!availabilityByDate[dateKey]) {
          availabilityByDate[dateKey] = [];
        }
        
        availabilityByDate[dateKey].push({
          time: timeStr,
          available: slot.isAvailable || false,
          dateTime: slot.dateTime,
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: slot.durationMinutes,
        });
      });
      
      console.log('Transformed availability:', availabilityByDate);
      console.log('Number of dates with slots:', Object.keys(availabilityByDate).length);
      
      setAvailability(availabilityByDate);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to load availability. Please try again.');
      setAvailability({});
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  // Handle slot selection with temporary reservation
  const handleSlotSelect = async (slotData) => {
    try {
      setLoading(true);
      setError(null);

      // Clear any existing reservation
      if (reservationTimer) {
        clearTimeout(reservationTimer);
      }

      // Create temporary reservation (mock implementation)
      // In real implementation, this would call the backend
      const reservationData = {
        doctorId,
        date: slotData.date,
        time: slotData.slot.time,
        patientId: user.id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      };

      setSelectedSlot(slotData);
      setReservedSlot(reservationData);

      // Set timer to clear reservation after 10 minutes
      const timer = setTimeout(() => {
        setReservedSlot(null);
        setSelectedSlot(null);
        setError('Your time slot reservation has expired. Please select a new slot.');
        setActiveStep(0);
      }, 10 * 60 * 1000);

      setReservationTimer(timer);
      setActiveStep(2); // Move to confirm details step
    } catch (err) {
      setError(err.message || 'Failed to reserve time slot');
    } finally {
      setLoading(false);
    }
  };

  // Handle continue from date/time selection
  const handleContinueFromDateTime = () => {
    if (selectedDate && selectedTime) {
      const slotData = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        slot: selectedTime,
      };
      handleSlotSelect(slotData);
    }
  };

  // Handle booking confirmation with optimistic updates
  const handleConfirmBooking = async () => {
    if (!selectedSlot || !reservedSlot) {
      setError('No time slot selected');
      return;
    }

    // Create appointment data
    const appointmentData = {
      doctorId: doctorId,
      appointmentDateTime: `${selectedSlot.date}T${selectedSlot.slot.time}:00`,
      reason: appointmentNotes.trim() || 'General consultation',
      notes: appointmentNotes.trim(),
      durationMinutes: 30,
    };

    // Create optimistic appointment for immediate UI feedback
    const optimisticData = {
      id: 'temp-' + Date.now(),
      ...appointmentData,
      doctor: doctorInfo,
      patient: user,
      createdAt: new Date().toISOString(),
      status: APPOINTMENT_STATUS.SCHEDULED,
    };

    // Execute booking with optimistic update
    await bookAppointment(
      () => appointmentService.bookAppointment(appointmentData),
      // Optimistic update
      () => {
        setOptimisticAppointment(optimisticData);
        setActiveStep(3); // Move to success step immediately
      },
      // Rollback function
      () => {
        setOptimisticAppointment(null);
        setActiveStep(2); // Go back to confirmation step
      }
    );

    // Clear reservation timer on success or failure
    if (reservationTimer) {
      clearTimeout(reservationTimer);
      setReservationTimer(null);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (reservationTimer) {
      clearTimeout(reservationTimer);
    }
    // Reset to appropriate step based on whether doctor was pre-selected
    setActiveStep(initialDoctorId ? 1 : 0);
    setSelectedSlot(null);
    setReservedSlot(null);
    setAppointmentNotes('');
    setError(null);
    setOptimisticAppointment(null);
    setBookingResult(null);
    // Reset doctor info if it wasn't pre-selected
    if (!initialDoctorId) {
      setDoctorId(null);
      setDoctorInfo(null);
    }
    onClose();
  };

  // Handle back navigation
  const handleBack = () => {
    const minStep = initialDoctorId ? 1 : 0; // Can't go back past doctor selection if doctor was pre-selected
    if (activeStep > minStep) {
      setActiveStep(activeStep - 1);
      if (activeStep === 2) {
        // Going back to slot selection, clear reservation
        if (reservationTimer) {
          clearTimeout(reservationTimer);
        }
        setReservedSlot(null);
        setSelectedSlot(null);
      }
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select a Doctor
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose a doctor from the list below to book an appointment.
            </Typography>
            
            {loadingDoctors ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : doctors.length === 0 ? (
              <Alert severity="warning">
                No doctors available at the moment. Please try again later.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {doctors.map((doctor) => (
                  <Grid item xs={12} key={doctor.id}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedDoctorId === doctor.id ? 2 : 1,
                        borderColor: selectedDoctorId === doctor.id ? 'primary.main' : 'divider',
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                      }}
                      onClick={() => {
                        setSelectedDoctorId(doctor.id);
                        setDoctorId(doctor.id);
                        setDoctorInfo(doctor);
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                            <Person />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="h6">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {doctor.specialty}
                            </Typography>
                            {doctor.experienceYears && (
                              <Typography variant="caption" color="text.secondary">
                                {doctor.experienceYears} years experience
                              </Typography>
                            )}
                          </Box>
                          {selectedDoctorId === doctor.id && (
                            <CheckCircle color="primary" />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {selectedDoctorId && (
              <Box mt={3} display="flex" justifyContent="flex-end">
                <Button 
                  variant="contained" 
                  onClick={() => setActiveStep(1)}
                  startIcon={<CalendarToday />}
                >
                  Continue to Select Time
                </Button>
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            {doctorId ? (
              <>
                <DateTimeSelectionStep
                  doctorInfo={doctorInfo}
                  availability={availability}
                  loading={loading}
                  error={error}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onDateSelect={handleDateSelect}
                  onTimeSelect={handleTimeSelect}
                  onFetchAvailability={handleFetchAvailability}
                />
                
                {selectedDate && selectedTime && (
                  <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button 
                      variant="contained" 
                      size="large"
                      onClick={handleContinueFromDateTime}
                      startIcon={<CheckCircle />}
                    >
                      Continue to Confirmation
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <Alert severity="warning">
                No doctor selected. Please close this dialog and select a doctor from the "Find Doctors" page.
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <ConfirmationStep
            doctorInfo={doctorInfo}
            selectedSlot={selectedSlot}
            appointmentNotes={appointmentNotes}
            onNotesChange={setAppointmentNotes}
            reservedSlot={reservedSlot}
          />
        );

      case 3:
        return (
          <SuccessStep
            bookingResult={bookingResult}
            doctorInfo={doctorInfo}
            selectedSlot={selectedSlot}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          Book Appointment
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        {activeStep === 0 && (
          <Button onClick={handleClose}>
            Cancel
          </Button>
        )}
        
        {activeStep === 1 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}
        
        {activeStep === 2 && (
          <>
            <Button onClick={handleBack}>
              Back
            </Button>
            <Button 
              variant="contained" 
              onClick={handleConfirmBooking}
              disabled={bookingLoading || !selectedSlot}
            >
              {bookingLoading ? <CircularProgress size={20} /> : 'Confirm Booking'}
            </Button>
          </>
        )}
        
        {activeStep === 3 && (
          <Button variant="contained" onClick={handleClose}>
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentBooking;