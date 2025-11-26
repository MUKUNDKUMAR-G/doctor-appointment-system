import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Badge,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Search,
  VerifiedUser,
  FilterList,
  GridView,
  ViewList,
  LocalHospital,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import AdminPageHeader from '../components/features/AdminPageHeader/AdminPageHeader';
import DoctorVerificationPanel from '../components/features/DoctorProfile/DoctorVerificationPanel';
import ReviewModerationPanel from '../components/features/DoctorProfile/ReviewModerationPanel';
import DoctorManagementGrid from '../components/features/DoctorManagement/DoctorManagementGrid';
import { useBulkActions } from '../hooks/useBulkActions';
import { useToast } from '../components/common/Toast/ToastProvider';
import ModernCard from '../components/common/ModernCard';

const AdminDoctorsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterVerification, setFilterVerification] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [verificationCount, setVerificationCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const {
    selectedItems: selectedDoctors,
    selectItem,
    deselectItem,
    selectAll,
    clearSelection,
    executeBulkAction,
    isProcessing,
  } = useBulkActions();

  useEffect(() => {
    fetchDoctors();
    fetchPendingVerifications();
    fetchFlaggedReviews();
  }, []);

  // Real-time updates for verification counts
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingVerifications();
      fetchFlaggedReviews();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/doctors');
      setDoctors(response.data || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingVerifications = async () => {
    try {
      const response = await api.get('/admin/credentials/pending');
      const verifications = response.data || [];
      setPendingVerifications(verifications);
      setVerificationCount(verifications.length);
    } catch (err) {
      console.error('Error fetching pending verifications:', err);
    }
  };

  const fetchFlaggedReviews = async () => {
    try {
      const response = await api.get('/admin/reviews/flagged');
      const reviews = response.data || [];
      setFlaggedReviews(reviews);
      setReviewCount(reviews.length);
    } catch (err) {
      console.error('Error fetching flagged reviews:', err);
    }
  };

  const handleToggleAvailability = async (doctorId, currentStatus) => {
    try {
      await api.put(`/admin/doctors/${doctorId}/availability`, { 
        isAvailable: !currentStatus 
      });
      showToast('Doctor availability updated successfully', 'success');
      fetchDoctors();
    } catch (err) {
      console.error('Error updating doctor availability:', err);
      showToast('Failed to update doctor availability', 'error');
    }
  };

  const handleVerifyDoctor = async (doctorId) => {
    try {
      await api.put(`/admin/doctors/${doctorId}/verify`, { isVerified: true });
      showToast('Doctor verified successfully', 'success');
      fetchDoctors();
      fetchPendingVerifications();
    } catch (err) {
      console.error('Error verifying doctor:', err);
      showToast('Failed to verify doctor', 'error');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedDoctors.length === 0) {
      showToast('Please select at least one doctor', 'warning');
      return;
    }

    await executeBulkAction(async (doctorIds) => {
      try {
        let response;
        switch (action) {
          case 'enable':
            response = await api.post('/admin/doctors/bulk/enable', { doctorIds });
            showToast(`${doctorIds.length} doctors enabled successfully`, 'success');
            break;
          case 'disable':
            response = await api.post('/admin/doctors/bulk/disable', { doctorIds });
            showToast(`${doctorIds.length} doctors disabled successfully`, 'success');
            break;
          case 'verify':
            response = await api.post('/admin/doctors/bulk/verify', { doctorIds });
            showToast(`${doctorIds.length} doctors verified successfully`, 'success');
            break;
          default:
            break;
        }
        fetchDoctors();
        fetchPendingVerifications();
      } catch (err) {
        console.error('Error performing bulk action:', err);
        showToast('Failed to perform bulk action', 'error');
        throw err;
      }
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      selectAll(filteredDoctors.map(d => d.id));
    } else {
      clearSelection();
    }
  };

  const handleSelectDoctor = (doctorId) => {
    if (selectedDoctors.includes(doctorId)) {
      deselectItem(doctorId);
    } else {
      selectItem(doctorId);
    }
  };

  const handleDoctorAction = (action, doctor) => {
    switch (action) {
      case 'view':
        navigate(`/doctors/${doctor.id}`);
        break;
      case 'toggleAvailability':
        handleToggleAvailability(doctor.id, doctor.isAvailable);
        break;
      case 'verify':
        handleVerifyDoctor(doctor.id);
        break;
      default:
        break;
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${doctor.user?.firstName} ${doctor.user?.lastName}`.toLowerCase();
    const email = doctor.user?.email?.toLowerCase() || '';
    const specialty = doctor.specialty?.toLowerCase() || '';
    
    const matchesSearch = fullName.includes(searchLower) || 
                          email.includes(searchLower) || 
                          specialty.includes(searchLower);

    // Specialty filter
    const matchesSpecialty = filterSpecialty === 'all' || doctor.specialty === filterSpecialty;

    // Verification filter
    const matchesVerification = filterVerification === 'all' || 
                                (filterVerification === 'verified' && doctor.isVerified) ||
                                (filterVerification === 'pending' && !doctor.isVerified);

    // Availability filter
    const matchesAvailability = filterAvailability === 'all' ||
                                (filterAvailability === 'available' && doctor.isAvailable) ||
                                (filterAvailability === 'unavailable' && !doctor.isAvailable);
    
    return matchesSearch && matchesSpecialty && matchesVerification && matchesAvailability;
  });

  // Get unique specialties for filter
  const specialties = [...new Set(doctors.map(d => d.specialty))].filter(Boolean);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const breadcrumbs = [
    { label: 'Doctors', icon: LocalHospital }
  ];

  return (
    <Container 
      maxWidth="xl" 
      sx={{ mt: 4, mb: 4 }}
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Breadcrumbs and Header */}
      <AdminPageHeader
        title="Doctor Management"
        subtitle="Manage doctor profiles, verifications, and reviews"
        breadcrumbs={breadcrumbs}
      />

      {/* Tabs */}
      <ModernCard variant="elevated" sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            },
          }}
        >
          <Tab 
            label={`All Doctors (${doctors.length})`}
            icon={<GridView />}
            iconPosition="start"
          />
          <Tab 
            label={
              <Badge badgeContent={verificationCount} color="error">
                Pending Verifications
              </Badge>
            }
            icon={<VerifiedUser />}
            iconPosition="start"
          />
          <Tab 
            label={
              <Badge badgeContent={reviewCount} color="warning">
                Review Moderation
              </Badge>
            }
            icon={<FilterList />}
            iconPosition="start"
          />
        </Tabs>
      </ModernCard>

      {/* All Doctors Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 0 && (
          <motion.div
            key="all-doctors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Search and Filters */}
            <ModernCard variant="elevated" sx={{ mb: 3, p: 3 }}>
              <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                <TextField
                  placeholder="Search doctors by name, email, or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  sx={{ flexGrow: 1, minWidth: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Specialty</InputLabel>
                  <Select
                    value={filterSpecialty}
                    label="Specialty"
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                  >
                    <SelectMenuItem value="all">All Specialties</SelectMenuItem>
                    {specialties.map(specialty => (
                      <SelectMenuItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectMenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Verification</InputLabel>
                  <Select
                    value={filterVerification}
                    label="Verification"
                    onChange={(e) => setFilterVerification(e.target.value)}
                  >
                    <SelectMenuItem value="all">All</SelectMenuItem>
                    <SelectMenuItem value="verified">Verified</SelectMenuItem>
                    <SelectMenuItem value="pending">Pending</SelectMenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Availability</InputLabel>
                  <Select
                    value={filterAvailability}
                    label="Availability"
                    onChange={(e) => setFilterAvailability(e.target.value)}
                  >
                    <SelectMenuItem value="all">All</SelectMenuItem>
                    <SelectMenuItem value="available">Available</SelectMenuItem>
                    <SelectMenuItem value="unavailable">Unavailable</SelectMenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Active Filters */}
              {(filterSpecialty !== 'all' || filterVerification !== 'all' || filterAvailability !== 'all') && (
                <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
                    Active Filters:
                  </Typography>
                  {filterSpecialty !== 'all' && (
                    <Chip
                      label={`Specialty: ${filterSpecialty}`}
                      size="small"
                      onDelete={() => setFilterSpecialty('all')}
                    />
                  )}
                  {filterVerification !== 'all' && (
                    <Chip
                      label={`Verification: ${filterVerification}`}
                      size="small"
                      onDelete={() => setFilterVerification('all')}
                    />
                  )}
                  {filterAvailability !== 'all' && (
                    <Chip
                      label={`Availability: ${filterAvailability}`}
                      size="small"
                      onDelete={() => setFilterAvailability('all')}
                    />
                  )}
                </Box>
              )}
            </ModernCard>

            {/* Bulk Actions */}
            <AnimatePresence>
              {selectedDoctors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ModernCard 
                    variant="gradient" 
                    gradient="primary"
                    sx={{ mb: 3, p: 2 }}
                  >
                    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                      <Typography variant="body1" fontWeight={600} color="white">
                        {selectedDoctors.length} doctor{selectedDoctors.length !== 1 ? 's' : ''} selected
                      </Typography>
                      <Box display="flex" gap={1} flexGrow={1} flexWrap="wrap">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleBulkAction('enable')}
                          disabled={isProcessing}
                          sx={{ 
                            bgcolor: 'success.main',
                            '&:hover': { bgcolor: 'success.dark' }
                          }}
                        >
                          Enable
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleBulkAction('disable')}
                          disabled={isProcessing}
                          sx={{ 
                            bgcolor: 'warning.main',
                            '&:hover': { bgcolor: 'warning.dark' }
                          }}
                        >
                          Disable
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VerifiedUser />}
                          onClick={() => handleBulkAction('verify')}
                          disabled={isProcessing}
                          sx={{ 
                            bgcolor: 'white',
                            color: 'primary.main',
                            '&:hover': { bgcolor: 'grey.100' }
                          }}
                        >
                          Verify
                        </Button>
                      </Box>
                      <Button
                        variant="text"
                        size="small"
                        onClick={clearSelection}
                        sx={{ color: 'white' }}
                      >
                        Clear Selection
                      </Button>
                    </Box>
                  </ModernCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Doctor Grid/Table */}
            <DoctorManagementGrid
              doctors={filteredDoctors}
              selectedDoctors={selectedDoctors}
              onSelectDoctor={handleSelectDoctor}
              onSelectAll={handleSelectAll}
              onDoctorAction={handleDoctorAction}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* No Results */}
            {filteredDoctors.length === 0 && (
              <ModernCard variant="elevated" sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No doctors found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search or filters
                </Typography>
              </ModernCard>
            )}
          </motion.div>
        )}

        {/* Pending Verifications Tab */}
        {activeTab === 1 && (
          <motion.div
            key="verifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DoctorVerificationPanel
              pendingVerifications={pendingVerifications}
              onVerify={handleVerifyDoctor}
              onRefresh={fetchPendingVerifications}
            />
          </motion.div>
        )}

        {/* Review Moderation Tab */}
        {activeTab === 2 && (
          <motion.div
            key="reviews"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ReviewModerationPanel
              flaggedReviews={flaggedReviews}
              onRefresh={fetchFlaggedReviews}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default AdminDoctorsPage;
