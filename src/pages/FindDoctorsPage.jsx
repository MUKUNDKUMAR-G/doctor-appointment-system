import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Chip,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import useApiCall from '../hooks/useApiCall';
import DoctorSearchFilter from '../components/features/DoctorSearchFilter';
import DoctorCard from '../components/features/DoctorCard';
import DoctorCardSkeleton from '../components/features/DoctorCard/DoctorCardSkeleton';
import { SearchOff, GridView, ViewList, Sort, Verified, Star, TrendingUp } from '@mui/icons-material';

const FindDoctorsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    specialty: '',
    experience: [0, 50],
    fee: [0, 10000],
    rating: 0,
    availability: '',
    verifiedOnly: false,
  });

  const {
    execute: fetchDoctors,
    isLoading: loadingDoctors,
    error: doctorsError,
  } = useApiCall({
    onSuccess: (data) => {
      setDoctors(data);
      setFilteredDoctors(data);
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

  // Apply sorting when sortBy or doctors change
  useEffect(() => {
    if (doctors.length > 0) {
      const sorted = [...doctors].sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'experience':
            return (b.experienceYears || 0) - (a.experienceYears || 0);
          case 'fee-low':
            return (a.consultationFee || 0) - (b.consultationFee || 0);
          case 'fee-high':
            return (b.consultationFee || 0) - (a.consultationFee || 0);
          case 'name':
            return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          case 'relevance':
          default:
            // Prioritize verified doctors, then by rating
            if (a.isVerified !== b.isVerified) {
              return b.isVerified ? 1 : -1;
            }
            return (b.rating || 0) - (a.rating || 0);
        }
      });
      setFilteredDoctors(sorted);
    }
  }, [sortBy, doctors]);

  // Handle search with filters
  const handleSearch = useCallback(() => {
    const searchParams = {};

    if (searchQuery.trim()) {
      searchParams.query = searchQuery.trim();
    }

    if (filters.specialty) {
      searchParams.specialty = filters.specialty;
    }

    if (filters.experience[0] > 0 || filters.experience[1] < 50) {
      searchParams.minExperience = filters.experience[0];
      searchParams.maxExperience = filters.experience[1];
    }

    if (filters.fee[0] > 0 || filters.fee[1] < 10000) {
      searchParams.minFee = filters.fee[0];
      searchParams.maxFee = filters.fee[1];
    }

    if (filters.rating > 0) {
      searchParams.minRating = filters.rating;
    }

    if (filters.availability) {
      searchParams.availability = filters.availability;
    }

    // If we have search params, use search endpoint, otherwise get all
    if (Object.keys(searchParams).length > 0) {
      fetchDoctors(() => doctorService.searchDoctors(searchParams));
    } else {
      fetchDoctors(() => doctorService.getAllDoctors());
    }
  }, [searchQuery, filters, fetchDoctors]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Handle sort change
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  // Handle view mode change
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      specialty: '',
      experience: [0, 50],
      fee: [0, 10000],
      rating: 0,
      availability: '',
    });
    fetchDoctors(() => doctorService.getAllDoctors());
  };

  // Handle book appointment
  const handleBookAppointment = (doctorId) => {
    navigate('/appointments', { state: { selectedDoctorId: doctorId } });
  };

  // Handle view profile
  const handleViewProfile = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
  };

  // Container variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Item variants for card animation
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <Container component="main" id="main-content" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          fontWeight={700}
          sx={{
            background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Find Doctors
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Search and book appointments with qualified healthcare professionals
        </Typography>
      </motion.div>

      {/* Search and Filter Section */}
      <DoctorSearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
        specialties={specialties}
        onClearFilters={handleClearFilters}
      />

      {/* Error Display */}
      {doctorsError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            {doctorsError}
          </Alert>
        </motion.div>
      )}

      {/* Results Section */}
      {loadingDoctors ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} lg={4} key={item}>
              <DoctorCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : filteredDoctors.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            textAlign="center"
            py={8}
            sx={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'grey.300',
            }}
          >
            <SearchOff sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.primary" gutterBottom fontWeight={600}>
              No doctors found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search criteria or filters
            </Typography>
            <Box display="flex" flexWrap="wrap" justifyContent="center" gap={1}>
              <Typography variant="body2" color="text.secondary">
                Suggestions:
              </Typography>
              {['Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics'].map((suggestion) => (
                <Typography
                  key={suggestion}
                  variant="body2"
                  color="primary"
                  sx={{
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    '&:hover': { fontWeight: 600 },
                  }}
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, specialty: suggestion }));
                    handleFilterChange('specialty', suggestion);
                    setTimeout(handleSearch, 100);
                  }}
                >
                  {suggestion}
                </Typography>
              ))}
            </Box>
          </Box>
        </motion.div>
      ) : (
        <>
          {/* Results Header with Sort and View Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6" fontWeight={600} color="text.primary">
                  {filteredDoctors.length} Doctor{filteredDoctors.length !== 1 ? 's' : ''} Found
                </Typography>
                {filters.verifiedOnly && (
                  <Chip
                    icon={<Verified />}
                    label="Verified Only"
                    color="success"
                    size="small"
                    onDelete={() => handleFilterChange('verifiedOnly', false)}
                  />
                )}
              </Box>

              <Box display="flex" gap={2} alignItems="center">
                {/* Sort Control */}
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={handleSortChange}
                    startAdornment={<Sort sx={{ mr: 1, color: 'text.secondary' }} />}
                  >
                    <MenuItem value="relevance">
                      <Box display="flex" alignItems="center" gap={1}>
                        <TrendingUp fontSize="small" />
                        Relevance
                      </Box>
                    </MenuItem>
                    <MenuItem value="rating">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Star fontSize="small" />
                        Highest Rated
                      </Box>
                    </MenuItem>
                    <MenuItem value="experience">Experience (High to Low)</MenuItem>
                    <MenuItem value="fee-low">Fee (Low to High)</MenuItem>
                    <MenuItem value="fee-high">Fee (High to Low)</MenuItem>
                    <MenuItem value="name">Name (A-Z)</MenuItem>
                  </Select>
                </FormControl>

                {/* View Mode Toggle */}
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewModeChange}
                  size="small"
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                >
                  <ToggleButton value="grid" aria-label="grid view">
                    <GridView />
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="list view">
                    <ViewList />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Paper>
          </motion.div>

          {/* Doctor Cards Grid/List with Staggered Animation */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              <AnimatePresence>
                {filteredDoctors.map((doctor, index) => (
                  <Grid
                    item
                    xs={12}
                    sm={viewMode === 'list' ? 12 : 6}
                    lg={viewMode === 'list' ? 12 : 4}
                    key={doctor.id}
                    component={motion.div}
                    variants={itemVariants}
                    layout
                  >
                    <DoctorCard
                      doctor={doctor}
                      onBookAppointment={handleBookAppointment}
                      onViewProfile={handleViewProfile}
                    />
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          </motion.div>
        </>
      )}
    </Container>
  );
};

export default FindDoctorsPage;
