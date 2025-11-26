import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Box,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  Divider,
  Paper,
} from '@mui/material';
import {
  Search,
  LocationOn,
  AccessTime,
  Phone,
  Email,
  CalendarToday,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import useApiCall from '../hooks/useApiCall';

const DoctorsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const {
    execute: fetchDoctors,
    isLoading: loadingDoctors,
    error: doctorsError,
  } = useApiCall({
    onSuccess: (data) => {
      setDoctors(data);
    },
    showErrorMessage: true,
  });

  const {
    execute: fetchSpecialties,
  } = useApiCall({
    onSuccess: (data) => {
      setSpecialties(data);
    },
  });

  // Load doctors and specialties on mount
  useEffect(() => {
    fetchDoctors(() => doctorService.getAllDoctors());
    fetchSpecialties(() => doctorService.getDoctorSpecialties());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchDoctors(() => doctorService.searchDoctors({ query: searchQuery }));
    } else if (selectedSpecialty) {
      fetchDoctors(() => doctorService.getAllDoctors(selectedSpecialty));
    } else {
      fetchDoctors(() => doctorService.getAllDoctors());
    }
  };

  // Handle specialty filter
  const handleSpecialtyChange = (event) => {
    const specialty = event.target.value;
    setSelectedSpecialty(specialty);
    if (specialty) {
      fetchDoctors(() => doctorService.getAllDoctors(specialty));
    } else {
      fetchDoctors(() => doctorService.getAllDoctors());
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('');
    fetchDoctors(() => doctorService.getAllDoctors());
  };

  // Handle book appointment
  const handleBookAppointment = (doctorId) => {
    navigate('/appointments', { state: { selectedDoctorId: doctorId } });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Find Doctors
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Search and book appointments with qualified healthcare professionals
      </Typography>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by doctor name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Specialty</InputLabel>
              <Select
                value={selectedSpecialty}
                label="Specialty"
                onChange={handleSpecialtyChange}
              >
                <MenuItem value="">All Specialties</MenuItem>
                {specialties.map((specialty) => (
                  <MenuItem key={specialty} value={specialty}>
                    {specialty}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box display="flex" gap={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                startIcon={<Search />}
              >
                Search
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
              >
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Section */}
      {loadingDoctors ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : doctorsError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {doctorsError}
        </Alert>
      ) : doctors.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No doctors found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {doctors.length} Doctor{doctors.length !== 1 ? 's' : ''} Found
          </Typography>
          
          <Grid container spacing={3}>
            {doctors.map((doctor) => (
              <Grid item xs={12} md={6} key={doctor.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                      <Avatar
                        sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
                      >
                        {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                      </Avatar>
                      
                      <Box flexGrow={1}>
                        <Typography variant="h6" component="div">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </Typography>
                        <Chip
                          label={doctor.specialty}
                          size="small"
                          color="primary"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box display="flex" flexDirection="column" gap={1}>
                      {doctor.qualifications && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Qualifications:</strong> {doctor.qualifications}
                        </Typography>
                      )}
                      
                      {doctor.experienceYears && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Experience:</strong> {doctor.experienceYears} years
                        </Typography>
                      )}

                      {doctor.location && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {doctor.location}
                          </Typography>
                        </Box>
                      )}

                      {doctor.consultationFee && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Consultation Fee:</strong> ₹{doctor.consultationFee}
                        </Typography>
                      )}

                      {doctor.rating && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Rating value={doctor.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            ({doctor.rating})
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CalendarToday />}
                      onClick={() => handleBookAppointment(doctor.id)}
                    >
                      Book Appointment
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default DoctorsPage;
