import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  Visibility,
  CalendarToday,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import api from '../services/api';
import AdminPageHeader from '../components/features/AdminPageHeader/AdminPageHeader';

const AdminAppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter(apt => apt.status === statusFilter));
    }
  }, [statusFilter, appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/appointments');
      setAppointments(response.data || []);
      setFilteredAppointments(response.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      case 'RESCHEDULED': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const breadcrumbs = [
    { label: 'Appointments', icon: CalendarToday }
  ];

  const headerActions = (
    <TextField
      select
      label="Filter by Status"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      size="small"
      sx={{ minWidth: 200 }}
    >
      <MenuItem value="ALL">All Appointments</MenuItem>
      <MenuItem value="SCHEDULED">Scheduled</MenuItem>
      <MenuItem value="COMPLETED">Completed</MenuItem>
      <MenuItem value="CANCELLED">Cancelled</MenuItem>
      <MenuItem value="RESCHEDULED">Rescheduled</MenuItem>
    </TextField>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs and Header */}
      <AdminPageHeader
        title="Appointment Management"
        subtitle="Monitor and manage all system appointments"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" py={4}>
                      No appointments found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.id}</TableCell>
                    <TableCell>
                      {appointment.patientName || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {appointment.doctorName ? `Dr. ${appointment.doctorName}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {appointment.appointmentDateTime 
                        ? format(parseISO(appointment.appointmentDateTime), 'MMM dd, yyyy h:mm a')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{appointment.durationMinutes || 30} min</TableCell>
                    <TableCell>
                      <Chip 
                        label={appointment.status} 
                        size="small" 
                        color={getStatusColor(appointment.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {appointment.reason || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {appointment.createdAt 
                        ? format(parseISO(appointment.createdAt), 'MMM dd, yyyy')
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box mt={2}>
        <Typography variant="body2" color="text.secondary">
          Total: {filteredAppointments.length} appointment(s)
        </Typography>
      </Box>
    </Container>
  );
};

export default AdminAppointmentsPage;
