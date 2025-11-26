import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Collapse,
  IconButton,
  Button,
  Chip,
  Rating,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import {
  Search,
  FilterList,
  ExpandMore,
  ExpandLess,
  Clear,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorSearchFilter = ({
  searchQuery,
  onSearchChange,
  onSearch,
  filters,
  onFilterChange,
  specialties = [],
  onClearFilters,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  
  // Debounce the search query
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);
  
  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      onSearchChange(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);
  
  // Sync local state with prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleExperienceChange = (event, newValue) => {
    onFilterChange('experience', newValue);
  };

  const handleFeeChange = (event, newValue) => {
    onFilterChange('fee', newValue);
  };

  const handleSpecialtyChange = (event) => {
    onFilterChange('specialty', event.target.value);
  };

  const handleRatingChange = (event, newValue) => {
    onFilterChange('rating', newValue);
  };

  const handleAvailabilityChange = (event) => {
    onFilterChange('availability', event.target.value);
  };

  const hasActiveFilters = () => {
    return (
      filters.specialty ||
      filters.experience[0] > 0 ||
      filters.experience[1] < 50 ||
      filters.fee[0] > 0 ||
      filters.fee[1] < 10000 ||
      filters.rating > 0 ||
      filters.availability ||
      filters.verifiedOnly
    );
  };

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      elevation={2}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      }}
    >
      {/* Search Bar */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            placeholder="Search by doctor name, specialty, or location..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
                </InputAdornment>
              ),
              endAdornment: localSearchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setLocalSearchQuery('');
                      onSearchChange('');
                    }}
                    edge="end"
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Box display="flex" gap={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={onSearch}
              startIcon={<Search />}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s',
              }}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              startIcon={<FilterList />}
              endIcon={isFilterOpen ? <ExpandLess /> : <ExpandMore />}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                minWidth: 'auto',
                px: 2,
              }}
            >
              Filters
              {hasActiveFilters() && (
                <Chip
                  size="small"
                  label="•"
                  color="primary"
                  sx={{ ml: 1, height: 20, minWidth: 20, '& .MuiChip-label': { px: 0.5 } }}
                />
              )}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Collapsible Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <Collapse in={isFilterOpen} timeout="auto">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Divider sx={{ my: 3 }} />

              <Grid container spacing={3}>
                {/* Specialty Filter */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Specialty</InputLabel>
                    <Select
                      value={filters.specialty}
                      label="Specialty"
                      onChange={handleSpecialtyChange}
                      sx={{ backgroundColor: 'white' }}
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

                {/* Availability Filter */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Availability</InputLabel>
                    <Select
                      value={filters.availability}
                      label="Availability"
                      onChange={handleAvailabilityChange}
                      sx={{ backgroundColor: 'white' }}
                    >
                      <MenuItem value="">Any Time</MenuItem>
                      <MenuItem value="today">Available Today</MenuItem>
                      <MenuItem value="week">Available This Week</MenuItem>
                      <MenuItem value="month">Available This Month</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Experience Slider */}
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom color="text.secondary" fontWeight={500}>
                    Experience (Years)
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={filters.experience}
                      onChange={handleExperienceChange}
                      valueLabelDisplay="auto"
                      min={0}
                      max={50}
                      marks={[
                        { value: 0, label: '0' },
                        { value: 25, label: '25' },
                        { value: 50, label: '50+' },
                      ]}
                      sx={{
                        '& .MuiSlider-thumb': {
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: '0 0 0 8px rgba(37, 99, 235, 0.16)',
                          },
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    {filters.experience[0]} - {filters.experience[1] === 50 ? '50+' : filters.experience[1]} years
                  </Typography>
                </Grid>

                {/* Fee Range Slider */}
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom color="text.secondary" fontWeight={500}>
                    Consultation Fee (₹)
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={filters.fee}
                      onChange={handleFeeChange}
                      valueLabelDisplay="auto"
                      min={0}
                      max={10000}
                      step={100}
                      marks={[
                        { value: 0, label: '₹0' },
                        { value: 5000, label: '₹5k' },
                        { value: 10000, label: '₹10k+' },
                      ]}
                      sx={{
                        '& .MuiSlider-thumb': {
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: '0 0 0 8px rgba(37, 99, 235, 0.16)',
                          },
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    ₹{filters.fee[0]} - ₹{filters.fee[1] === 10000 ? '10,000+' : filters.fee[1]}
                  </Typography>
                </Grid>

                {/* Rating Filter */}
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom color="text.secondary" fontWeight={500}>
                    Minimum Rating
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Rating
                      value={filters.rating}
                      onChange={handleRatingChange}
                      size="large"
                      sx={{
                        '& .MuiRating-iconFilled': {
                          color: '#FFA500',
                        },
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {filters.rating > 0 ? `${filters.rating}+ stars` : 'Any rating'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Verified Only Filter */}
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom color="text.secondary" fontWeight={500}>
                    Verification Status
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={filters.verifiedOnly ? 'verified' : 'all'}
                      onChange={(e) => onFilterChange('verifiedOnly', e.target.value === 'verified')}
                      sx={{ backgroundColor: 'white' }}
                    >
                      <MenuItem value="all">All Doctors</MenuItem>
                      <MenuItem value="verified">Verified Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="flex-end" gap={2}>
                    <Button
                      variant="outlined"
                      onClick={onClearFilters}
                      startIcon={<Clear />}
                      disabled={!hasActiveFilters()}
                      sx={{ textTransform: 'none' }}
                    >
                      Clear Filters
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        onSearch();
                        setIsFilterOpen(false);
                      }}
                      startIcon={<Search />}
                      sx={{ textTransform: 'none' }}
                    >
                      Apply Filters
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </motion.div>
          </Collapse>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {hasActiveFilters() && !isFilterOpen && (
        <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
          {filters.specialty && (
            <Chip
              label={`Specialty: ${filters.specialty}`}
              onDelete={() => onFilterChange('specialty', '')}
              color="primary"
              variant="outlined"
            />
          )}
          {(filters.experience[0] > 0 || filters.experience[1] < 50) && (
            <Chip
              label={`Experience: ${filters.experience[0]}-${filters.experience[1]} years`}
              onDelete={() => onFilterChange('experience', [0, 50])}
              color="primary"
              variant="outlined"
            />
          )}
          {(filters.fee[0] > 0 || filters.fee[1] < 10000) && (
            <Chip
              label={`Fee: ₹${filters.fee[0]}-₹${filters.fee[1]}`}
              onDelete={() => onFilterChange('fee', [0, 10000])}
              color="primary"
              variant="outlined"
            />
          )}
          {filters.rating > 0 && (
            <Chip
              label={`Rating: ${filters.rating}+ stars`}
              onDelete={() => onFilterChange('rating', 0)}
              color="primary"
              variant="outlined"
            />
          )}
          {filters.availability && (
            <Chip
              label={`Availability: ${filters.availability}`}
              onDelete={() => onFilterChange('availability', '')}
              color="primary"
              variant="outlined"
            />
          )}
          {filters.verifiedOnly && (
            <Chip
              label="Verified Only"
              onDelete={() => onFilterChange('verifiedOnly', false)}
              color="success"
              variant="outlined"
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default DoctorSearchFilter;
