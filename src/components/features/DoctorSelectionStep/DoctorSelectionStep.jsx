import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import { Search, CheckCircle } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ModernCard from '../../common/ModernCard/ModernCard';
import AnimatedButton from '../../common/AnimatedButton/AnimatedButton';
import DoctorCard from '../DoctorCard/DoctorCard';
import { animations, staggerContainer, staggerItem } from '../../../theme/animations';

const DoctorSelectionStep = ({ 
  doctors = [], 
  loading = false, 
  error = null,
  selectedDoctorId,
  onDoctorSelect,
  onContinue,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter doctors based on search query
  const filteredDoctors = doctors.filter((doctor) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    const specialty = (doctor.specialty || '').toLowerCase();
    
    return fullName.includes(searchLower) || specialty.includes(searchLower);
  });

  const handleDoctorClick = (doctorId) => {
    onDoctorSelect(doctorId);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Select a Doctor
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose a doctor from the list below to book an appointment.
        </Typography>
        
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Select a Doctor
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select a Doctor
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose a doctor from the list below to book an appointment.
      </Typography>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search by doctor name or specialty..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <Alert severity="info">
          {searchQuery 
            ? `No doctors found matching "${searchQuery}"`
            : 'No doctors available at the moment. Please try again later.'
          }
        </Alert>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <Grid container spacing={2}>
            {filteredDoctors.map((doctor) => (
              <Grid item xs={12} key={doctor.id}>
                <motion.div variants={staggerItem}>
                  <ModernCard
                    variant="outlined"
                    hover
                    onClick={() => handleDoctorClick(doctor.id)}
                    sx={{
                      position: 'relative',
                      border: selectedDoctorId === doctor.id ? 2 : 1,
                      borderColor: selectedDoctorId === doctor.id ? 'primary.main' : 'divider',
                      bgcolor: selectedDoctorId === doctor.id ? 'primary.50' : 'background.paper',
                      transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
                    }}
                  >
                    <Box sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        {/* Doctor Avatar */}
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                        </Box>

                        {/* Doctor Info */}
                        <Box flex={1}>
                          <Typography variant="h6" sx={{ mb: 0.5 }}>
                            Dr. {doctor.firstName} {doctor.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {doctor.specialty}
                          </Typography>
                          {doctor.experienceYears && (
                            <Typography variant="caption" color="text.secondary">
                              {doctor.experienceYears} years experience
                            </Typography>
                          )}
                        </Box>

                        {/* Selection Indicator */}
                        <AnimatePresence>
                          {selectedDoctorId === doctor.id && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{
                                type: 'spring',
                                stiffness: 260,
                                damping: 20,
                              }}
                            >
                              <CheckCircle 
                                color="primary" 
                                sx={{ 
                                  fontSize: 32,
                                  filter: 'drop-shadow(0 2px 4px rgba(37, 99, 235, 0.3))',
                                }} 
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Box>
                    </Box>
                  </ModernCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}

      {/* Continue Button */}
      <AnimatePresence>
        {selectedDoctorId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              duration: animations.duration.standard / 1000,
              ease: animations.easing.easeOut,
            }}
          >
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <AnimatedButton
                variant="contained"
                size="large"
                onClick={onContinue}
              >
                Continue to Select Time
              </AnimatedButton>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default DoctorSelectionStep;
