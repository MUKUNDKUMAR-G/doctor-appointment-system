import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Fab } from '@mui/material';
import { Add } from '@mui/icons-material';
import MyAppointmentsPage from './MyAppointmentsPage';
import LazyAppointmentBooking from '../components/LazyAppointmentBooking';
import { doctorService } from '../services/doctorService';

const AppointmentsPage = () => {
  const location = useLocation();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  // Check if we came from Find Doctors page with a selected doctor
  useEffect(() => {
    if (location.state?.selectedDoctorId) {
      const doctorId = location.state.selectedDoctorId;
      setSelectedDoctorId(doctorId);
      
      // Fetch doctor details
      doctorService.getDoctorById(doctorId)
        .then(doctor => {
          setSelectedDoctor(doctor);
          setBookingOpen(true); // Auto-open booking dialog
        })
        .catch(error => {
          console.error('Failed to fetch doctor details:', error);
          setBookingOpen(true); // Still open dialog even if fetch fails
        });
    }
  }, [location.state]);

  return (
    <>
      <MyAppointmentsPage />

      {/* Quick Book Appointment FAB */}
      <Fab
        color="primary"
        aria-label="book appointment"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1E40AF 0%, #5B21B6 100%)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
        }}
        onClick={() => setBookingOpen(true)}
      >
        <Add />
      </Fab>

      {/* Appointment Booking Dialog */}
      <LazyAppointmentBooking
        doctorId={selectedDoctorId}
        doctorInfo={selectedDoctor}
        open={bookingOpen}
        onClose={() => {
          setBookingOpen(false);
          setSelectedDoctor(null);
          setSelectedDoctorId(null);
        }}
        onBookingComplete={() => {
          setBookingOpen(false);
          setSelectedDoctor(null);
          setSelectedDoctorId(null);
          // Refresh the page or trigger a refresh
          window.location.reload();
        }}
      />
    </>
  );
};

export default AppointmentsPage;