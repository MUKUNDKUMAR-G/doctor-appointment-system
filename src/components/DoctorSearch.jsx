import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Paper,
  Pagination,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { doctorService } from '../services/doctorService';
import DoctorCard from './DoctorCard';

const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'General Practice',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
];

const ITEMS_PER_PAGE = 6;

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const doctorsData = await doctorService.getAllDoctors();
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
      } catch (err) {
        setError(err.message || 'Failed to fetch doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Filter doctors based on search term and specialty
  useEffect(() => {
    let filtered = doctors;

    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter(doctor => 
        doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase()
      );
    }

    // Filter by search term (name, specialty, qualifications)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doctor => 
        doctor.user.firstName.toLowerCase().includes(term) ||
        doctor.user.lastName.toLowerCase().includes(term) ||
        doctor.specialty.toLowerCase().includes(term) ||
        doctor.qualifications.toLowerCase().includes(term)
      );
    }

    setFilteredDoctors(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [doctors, searchTerm, selectedSpecialty]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSpecialtyChange = (event) => {
    setSelectedSpecialty(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleClearSpecialty = () => {
    setSelectedSpecialty('');
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDoctors = filteredDoctors.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Find Doctors
      </Typography>

      {/* Search and Filter Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search doctors"
              placeholder="Search by name, specialty, or qualifications"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} size="small">
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Specialty</InputLabel>
              <Select
                value={selectedSpecialty}
                onChange={handleSpecialtyChange}
                label="Specialty"
              >
                <MenuItem value="">
                  <em>All Specialties</em>
                </MenuItem>
                {SPECIALTIES.map((specialty) => (
                  <MenuItem key={specialty} value={specialty}>
                    {specialty}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            {selectedSpecialty && (
              <IconButton onClick={handleClearSpecialty} color="primary">
                <Clear />
              </IconButton>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results Summary */}
      <Typography variant="h6" gutterBottom>
        {filteredDoctors.length === 0 
          ? 'No doctors found' 
          : `${filteredDoctors.length} doctor${filteredDoctors.length !== 1 ? 's' : ''} found`
        }
      </Typography>

      {/* Doctor Cards Grid */}
      {currentDoctors.length > 0 ? (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {currentDoctors.map((doctor) => (
              <Grid item xs={12} sm={6} md={4} key={doctor.id}>
                <DoctorCard doctor={doctor} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
        !loading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm || selectedSpecialty 
                ? 'No doctors match your search criteria. Try adjusting your filters.'
                : 'No doctors available at the moment.'
              }
            </Typography>
          </Paper>
        )
      )}
    </Box>
  );
};

export default DoctorSearch;