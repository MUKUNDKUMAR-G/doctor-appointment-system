import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { parseISO, isAfter, isBefore, addHours } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { doctorService } from '../services/doctorService';
import { APPOINTMENT_STATUS } from '../utils/constants';
import AppointmentTabs from '../components/features/AppointmentTabs';
import AppointmentReminder from '../components/features/AppointmentReminder';
import AppointmentCard from '../components/features/AppointmentCard';
import AppointmentCardSkeleton from '../components/features/AppointmentCard/AppointmentCardSkeleton';
import LazyAppointmentDetails from '../components/LazyAppointmentDetails';
import { ReviewPrompt, ReviewModal } from '../components/features/ReviewSubmission';
import { showToast } from '../components/common/Toast/toast.jsx';

const MyAppointmentsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reminderDismissed, setReminderDismissed] = useState(false);
  
  // Dialog states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Review states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [appointmentToReview, setAppointmentToReview] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await appointmentService.getPatientAppointments(user.id);
        
        // Sort appointments by date
        const sortedAppointments = data.sort((a, b) => {
          const dateA = parseISO(a.appointmentDateTime);
          const dateB = parseISO(b.appointmentDateTime);
          return dateA.getTime() - dateB.getTime();
        });

        setAppointments(sortedAppointments);
      } catch (err) {
        setError(err.message || 'Failed to fetch appointments');
        showToast.error('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAppointments();
    }
  }, [user?.id]);

  // Filter appointments by tab
  const getFilteredAppointments = () => {
    const now = new Date();
    
    switch (activeTab) {
      case 0: // Upcoming
        return appointments.filter(apt => {
          const aptDate = parseISO(apt.appointmentDateTime);
          return apt.status === APPOINTMENT_STATUS.SCHEDULED && isAfter(aptDate, now);
        });
      
      case 1: // Past
        return appointments.filter(apt => {
          const aptDate = parseISO(apt.appointmentDateTime);
          return (
            apt.status === APPOINTMENT_STATUS.COMPLETED ||
            (apt.status === APPOINTMENT_STATUS.SCHEDULED && isBefore(aptDate, now))
          );
        });
      
      case 2: // Cancelled
        return appointments.filter(apt => 
          apt.status === APPOINTMENT_STATUS.CANCELLED || 
          apt.status === APPOINTMENT_STATUS.RESCHEDULED
        );
      
      default:
        return [];
    }
  };

  // Get next upcoming appointment for reminder
  const getNextAppointment = () => {
    const now = new Date();
    const upcoming = appointments
      .filter(apt => {
        const aptDate = parseISO(apt.appointmentDateTime);
        return apt.status === APPOINTMENT_STATUS.SCHEDULED && isAfter(aptDate, now);
      })
      .sort((a, b) => {
        const dateA = parseISO(a.appointmentDateTime);
        const dateB = parseISO(b.appointmentDateTime);
        return dateA.getTime() - dateB.getTime();
      });
    
    return upcoming[0] || null;
  };

  // Get appointment counts for tabs
  const getCounts = () => {
    const now = new Date();
    
    return {
      upcoming: appointments.filter(apt => {
        const aptDate = parseISO(apt.appointmentDateTime);
        return apt.status === APPOINTMENT_STATUS.SCHEDULED && isAfter(aptDate, now);
      }).length,
      
      past: appointments.filter(apt => {
        const aptDate = parseISO(apt.appointmentDateTime);
        return (
          apt.status === APPOINTMENT_STATUS.COMPLETED ||
          (apt.status === APPOINTMENT_STATUS.SCHEDULED && isBefore(aptDate, now))
        );
      }).length,
      
      cancelled: appointments.filter(apt => 
        apt.status === APPOINTMENT_STATUS.CANCELLED || 
        apt.status === APPOINTMENT_STATUS.RESCHEDULED
      ).length,
    };
  };

  // Check if appointment can be modified
  const canModifyAppointment = (appointment) => {
    if (appointment.status !== APPOINTMENT_STATUS.SCHEDULED) return false;
    
    const appointmentDate = parseISO(appointment.appointmentDateTime);
    const now = new Date();
    
    return isAfter(appointmentDate, addHours(now, 2));
  };

  // Check if appointment can be cancelled
  const canCancelAppointment = (appointment) => {
    if (appointment.status !== APPOINTMENT_STATUS.SCHEDULED) return false;
    
    const appointmentDate = parseISO(appointment.appointmentDateTime);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilAppointment >= 24;
  };

  // Handle view details
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailsOpen(true);
  };

  // Handle reschedule
  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailsOpen(true);
  };

  // Handle cancel
  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  // Handle cancel confirmation
  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);
      
      await appointmentService.cancelAppointment(selectedAppointment.id, cancelReason);
      
      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === selectedAppointment.id
            ? { ...apt, status: APPOINTMENT_STATUS.CANCELLED }
            : apt
        )
      );
      
      showToast.success('Appointment cancelled successfully');
      setCancelDialogOpen(false);
      setCancelReason('');
      setSelectedAppointment(null);
    } catch (err) {
      showToast.error(err.message || 'Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle appointment update from details dialog
  const handleAppointmentUpdate = (updatedAppointment) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === updatedAppointment.id ? updatedAppointment : apt
      )
    );
  };

  // Get completed appointments that can be reviewed
  const getReviewableAppointment = () => {
    const now = new Date();
    const completed = appointments.filter(apt => {
      const aptDate = parseISO(apt.appointmentDateTime);
      return (
        apt.status === APPOINTMENT_STATUS.COMPLETED &&
        isBefore(aptDate, now) &&
        !apt.hasReview // Assuming backend provides this flag
      );
    });
    
    // Return the most recent completed appointment
    return completed.sort((a, b) => {
      const dateA = parseISO(a.appointmentDateTime);
      const dateB = parseISO(b.appointmentDateTime);
      return dateB.getTime() - dateA.getTime();
    })[0] || null;
  };

  // Handle review prompt click
  const handleReviewClick = (appointment) => {
    setAppointmentToReview(appointment);
    setReviewModalOpen(true);
  };

  // Handle review submission
  const handleReviewSubmit = async (reviewData) => {
    try {
      setReviewSubmitting(true);
      
      await doctorService.submitReview(reviewData);
      
      // Update local state to mark appointment as reviewed
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === reviewData.appointmentId
            ? { ...apt, hasReview: true }
            : apt
        )
      );
      
      showToast.success('Review submitted successfully!');
      setReviewModalOpen(false);
      setAppointmentToReview(null);
    } catch (err) {
      showToast.error(err.message || 'Failed to submit review');
      throw err; // Re-throw to let form handle it
    } finally {
      setReviewSubmitting(false);
    }
  };

  const filteredAppointments = getFilteredAppointments();
  const nextAppointment = getNextAppointment();
  const counts = getCounts();
  const reviewableAppointment = getReviewableAppointment();

  return (
    <Container component="main" id="main-content" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Page Header */}
      <Box mb={4}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          My Appointments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your healthcare appointments
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Appointment Reminder */}
      {!reminderDismissed && nextAppointment && activeTab === 0 && (
        <AppointmentReminder
          appointment={nextAppointment}
          onDismiss={() => setReminderDismissed(true)}
          onViewDetails={() => handleViewDetails(nextAppointment)}
        />
      )}

      {/* Tabbed Interface */}
      <AppointmentTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      >
        {loading ? (
          <Grid container spacing={2}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} key={i}>
                <AppointmentCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : filteredAppointments.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'primary.lighter',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 3,
              }}
            >
              <Typography variant="h3" color="primary.main">
                📅
              </Typography>
            </Box>
            <Typography variant="h6" gutterBottom>
              {activeTab === 0 && 'No Upcoming Appointments'}
              {activeTab === 1 && 'No Past Appointments'}
              {activeTab === 2 && 'No Cancelled Appointments'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 0 && 'You have no scheduled appointments. Book an appointment with a doctor to get started.'}
              {activeTab === 1 && 'You have no appointment history yet.'}
              {activeTab === 2 && 'You have no cancelled appointments.'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredAppointments.map((appointment) => (
              <Grid item xs={12} key={appointment.id}>
                <AppointmentCard
                  appointment={appointment}
                  onViewDetails={handleViewDetails}
                  onReschedule={handleReschedule}
                  onCancel={handleCancelClick}
                  canModify={canModifyAppointment(appointment)}
                  canCancel={canCancelAppointment(appointment)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </AppointmentTabs>

      {/* Appointment Details Dialog */}
      <LazyAppointmentDetails
        appointment={selectedAppointment}
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedAppointment(null);
        }}
        onAppointmentUpdate={handleAppointmentUpdate}
      />

      {/* Cancel Confirmation Dialog */}
      <Dialog 
        open={cancelDialogOpen} 
        onClose={() => !actionLoading && setCancelDialogOpen(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to cancel this appointment?
          </Typography>
          
          {selectedAppointment && (
            <Box
              sx={{
                p: 2,
                mt: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Appointment Details
              </Typography>
              <Typography variant="body2">
                Doctor: {selectedAppointment.doctorName ? `Dr. ${selectedAppointment.doctorName}` : 'Unknown Doctor'}
              </Typography>
              <Typography variant="body2">
                Date: {selectedAppointment.appointmentDateTime && 
                  new Date(selectedAppointment.appointmentDateTime).toLocaleString()}
              </Typography>
            </Box>
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
            disabled={actionLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={actionLoading}>
            Keep Appointment
          </Button>
          <Button 
            onClick={handleCancelConfirm}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : 'Cancel Appointment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Prompt for Completed Appointments */}
      {reviewableAppointment && activeTab === 1 && (
        <ReviewPrompt
          appointment={reviewableAppointment}
          onReviewClick={handleReviewClick}
          onDismiss={() => {}}
        />
      )}

      {/* Review Submission Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        appointment={appointmentToReview}
        onClose={() => {
          setReviewModalOpen(false);
          setAppointmentToReview(null);
        }}
        onSubmit={handleReviewSubmit}
        isSubmitting={reviewSubmitting}
      />
    </Container>
  );
};

export default MyAppointmentsPage;
