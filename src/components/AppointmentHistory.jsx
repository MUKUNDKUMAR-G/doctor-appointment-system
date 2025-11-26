import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FilterList,
  Clear,
  Refresh,
  CalendarToday,
  History,
  Upcoming,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { APPOINTMENT_STATUS } from '../utils/constants';
import AppointmentList from './AppointmentList';
import AppointmentDetails from './AppointmentDetails';

const AppointmentHistory = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState(null);
  const [dateToFilter, setDateToFilter] = useState(null);
  const [doctorFilter, setDoctorFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Detail dialog state
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch appointments on component mount and refresh trigger
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await appointmentService.getPatientAppointments(user.id);
        
        // Sort appointments by date (newest first)
        const sortedAppointments = data.sort((a, b) => {
          const dateA = parseISO(a.appointmentDateTime);
          const dateB = parseISO(b.appointmentDateTime);
          return dateB.getTime() - dateA.getTime();
        });

        setAppointments(sortedAppointments);
      } catch (err) {
        setError(err.message || 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAppointments();
    }
  }, [user?.id, refreshTrigger]);

  // Apply filters whenever appointments or filter criteria change
  useEffect(() => {
    let filtered = [...appointments];

    // Filter by tab (upcoming vs past)
    const now = new Date();
    if (activeTab === 0) {
      // Upcoming appointments
      filtered = filtered.filter(appointment => {
        const appointmentDate = parseISO(appointment.appointmentDateTime);
        return isAfter(appointmentDate, now) || format(appointmentDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
      });
    } else {
      // Past appointments
      filtered = filtered.filter(appointment => {
        const appointmentDate = parseISO(appointment.appointmentDateTime);
        return isBefore(appointmentDate, now) && format(appointmentDate, 'yyyy-MM-dd') !== format(now, 'yyyy-MM-dd');
      });
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }

    // Apply date range filter
    if (dateFromFilter) {
      filtered = filtered.filter(appointment => {
        const appointmentDate = parseISO(appointment.appointmentDateTime);
        return isAfter(appointmentDate, startOfDay(dateFromFilter)) || 
               format(appointmentDate, 'yyyy-MM-dd') === format(dateFromFilter, 'yyyy-MM-dd');
      });
    }

    if (dateToFilter) {
      filtered = filtered.filter(appointment => {
        const appointmentDate = parseISO(appointment.appointmentDateTime);
        return isBefore(appointmentDate, endOfDay(dateToFilter)) || 
               format(appointmentDate, 'yyyy-MM-dd') === format(dateToFilter, 'yyyy-MM-dd');
      });
    }

    // Apply doctor filter
    if (doctorFilter) {
      filtered = filtered.filter(appointment => {
        const doctorName = appointment.doctorName || '';
        return doctorName.toLowerCase().includes(doctorFilter.toLowerCase());
      });
    }

    setFilteredAppointments(filtered);
  }, [appointments, activeTab, statusFilter, dateFromFilter, dateToFilter, doctorFilter]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('');
    setDateFromFilter(null);
    setDateToFilter(null);
    setDoctorFilter('');
  };

  // Handle appointment update
  const handleAppointmentUpdate = (updatedAppointment) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === updatedAppointment.id ? updatedAppointment : apt
      )
    );
    // No need to refresh - state is already updated
  };

  // Get unique doctors for filter dropdown
  const uniqueDoctors = [...new Set(
    appointments
      .filter(apt => apt.doctorName)
      .map(apt => apt.doctorName)
  )];

  // Count appointments by status for badges
  const upcomingCount = appointments.filter(apt => {
    const appointmentDate = parseISO(apt.appointmentDateTime);
    const now = new Date();
    return isAfter(appointmentDate, now) || format(appointmentDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
  }).length;

  const pastCount = appointments.filter(apt => {
    const appointmentDate = parseISO(apt.appointmentDateTime);
    const now = new Date();
    return isBefore(appointmentDate, now) && format(appointmentDate, 'yyyy-MM-dd') !== format(now, 'yyyy-MM-dd');
  }).length;

  if (loading && appointments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" component="h1">
            My Appointments
          </Typography>
          
          <Box display="flex" gap={1}>
            <Tooltip title="Toggle Filters">
              <IconButton onClick={() => setShowFilters(!showFilters)}>
                <FilterList />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        {showFilters && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">
                Filters
              </Typography>
              <Button
                startIcon={<Clear />}
                onClick={clearFilters}
                size="small"
              >
                Clear All
              </Button>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={2}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  {Object.values(APPOINTMENT_STATUS).map(status => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <DatePicker
                label="From Date"
                value={dateFromFilter}
                onChange={setDateFromFilter}
                slotProps={{ textField: { size: 'small' } }}
              />

              <DatePicker
                label="To Date"
                value={dateToFilter}
                onChange={setDateToFilter}
                slotProps={{ textField: { size: 'small' } }}
              />

              <TextField
                size="small"
                label="Doctor Name"
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                sx={{ minWidth: 200 }}
              />
            </Box>

            {/* Active Filters Display */}
            {(statusFilter || dateFromFilter || dateToFilter || doctorFilter) && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active Filters:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {statusFilter && (
                    <Chip
                      label={`Status: ${statusFilter}`}
                      onDelete={() => setStatusFilter('')}
                      size="small"
                    />
                  )}
                  {dateFromFilter && (
                    <Chip
                      label={`From: ${format(dateFromFilter, 'MMM dd, yyyy')}`}
                      onDelete={() => setDateFromFilter(null)}
                      size="small"
                    />
                  )}
                  {dateToFilter && (
                    <Chip
                      label={`To: ${format(dateToFilter, 'MMM dd, yyyy')}`}
                      onDelete={() => setDateToFilter(null)}
                      size="small"
                    />
                  )}
                  {doctorFilter && (
                    <Chip
                      label={`Doctor: ${doctorFilter}`}
                      onDelete={() => setDoctorFilter('')}
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={
                <Badge badgeContent={upcomingCount} color="primary">
                  <Upcoming />
                </Badge>
              }
              label="Upcoming" 
              iconPosition="start"
            />
            <Tab 
              icon={
                <Badge badgeContent={pastCount} color="secondary">
                  <History />
                </Badge>
              }
              label="Past Appointments" 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {activeTab === 0 ? 'No Upcoming Appointments' : 'No Past Appointments'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {(statusFilter || dateFromFilter || dateToFilter || doctorFilter) 
                ? 'No appointments match your current filters.'
                : activeTab === 0 
                  ? 'You have no scheduled appointments. Book an appointment with a doctor to get started.'
                  : 'You have no appointment history yet.'
              }
            </Typography>
          </Paper>
        ) : (
          <AppointmentList
            appointments={filteredAppointments}
            onAppointmentSelect={(appointment) => {
              setSelectedAppointment(appointment);
              setDetailsOpen(true);
            }}
            onAppointmentUpdate={handleAppointmentUpdate}
            showPastAppointments={activeTab === 1}
          />
        )}

        {/* Appointment Details Dialog */}
        <AppointmentDetails
          appointment={selectedAppointment}
          open={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedAppointment(null);
          }}
          onAppointmentUpdate={handleAppointmentUpdate}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default AppointmentHistory;