import React, { useState } from 'react';
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Checkbox,
  Avatar,
  Typography,
  Chip,
  Rating,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  GridView,
  ViewList,
  MoreVert,
  Visibility,
  CheckCircle,
  Block,
  VerifiedUser,
  Pending,
  LocationOn,
  School,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ModernCard from '../../common/ModernCard';
import DoctorCard from '../DoctorCard/DoctorCard';

const DoctorManagementGrid = ({
  doctors,
  selectedDoctors,
  onSelectDoctor,
  onSelectAll,
  onDoctorAction,
  viewMode = 'grid',
  onViewModeChange,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const handleMenuOpen = (event, doctor) => {
    setAnchorEl(event.currentTarget);
    setSelectedDoctor(doctor);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDoctor(null);
  };

  const handleAction = (action) => {
    if (selectedDoctor) {
      onDoctorAction(action, selectedDoctor);
    }
    handleMenuClose();
  };

  const isAllSelected = doctors.length > 0 && selectedDoctors.length === doctors.length;
  const isSomeSelected = selectedDoctors.length > 0 && selectedDoctors.length < doctors.length;

  return (
    <Box>
      {/* View Mode Toggle */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => newMode && onViewModeChange(newMode)}
          size="small"
          aria-label="view mode"
        >
          <ToggleButton value="grid" aria-label="grid view">
            <Tooltip title="Grid View">
              <GridView />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
            <Tooltip title="Table View">
              <ViewList />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <Grid container spacing={3}>
          <AnimatePresence mode="popLayout">
            {doctors.map((doctor, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={doctor.id}
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Box position="relative">
                  {/* Selection Checkbox */}
                  <Box
                    position="absolute"
                    top={8}
                    left={8}
                    zIndex={1}
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: '50%',
                      boxShadow: 2,
                    }}
                  >
                    <Checkbox
                      checked={selectedDoctors.includes(doctor.id)}
                      onChange={() => onSelectDoctor(doctor.id)}
                      size="small"
                    />
                  </Box>

                  {/* Doctor Card */}
                  <ModernCard
                    variant="elevated"
                    hover
                    sx={{ height: '100%' }}
                  >
                    <Box p={2}>
                      {/* Doctor Header */}
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Avatar
                          src={doctor.avatarUrl}
                          sx={{ width: 60, height: 60 }}
                        >
                          {doctor.user?.firstName?.[0]}{doctor.user?.lastName?.[0]}
                        </Avatar>
                        <Box flexGrow={1}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {doctor.user?.email}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, doctor)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>

                      {/* Specialty */}
                      <Chip
                        label={doctor.specialty}
                        size="small"
                        color="primary"
                        sx={{ mb: 2 }}
                      />

                      {/* Details */}
                      <Box display="flex" flexDirection="column" gap={1} mb={2}>
                        {doctor.experienceYears && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <School sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {doctor.experienceYears} years exp.
                            </Typography>
                          </Box>
                        )}
                        {doctor.location && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {doctor.location}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Rating */}
                      {doctor.rating && (
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Rating value={doctor.rating} readOnly size="small" precision={0.1} />
                          <Typography variant="caption" color="text.secondary">
                            ({doctor.rating.toFixed(1)})
                          </Typography>
                        </Box>
                      )}

                      {/* Status Chips */}
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {doctor.isVerified ? (
                          <Chip
                            label="Verified"
                            size="small"
                            color="success"
                            icon={<VerifiedUser />}
                          />
                        ) : (
                          <Chip
                            label="Pending"
                            size="small"
                            color="warning"
                            icon={<Pending />}
                          />
                        )}
                        <Chip
                          label={doctor.isAvailable ? 'Available' : 'Unavailable'}
                          size="small"
                          color={doctor.isAvailable ? 'success' : 'default'}
                          icon={doctor.isAvailable ? <CheckCircle /> : <Block />}
                        />
                      </Box>
                    </Box>
                  </ModernCard>
                </Box>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <ModernCard variant="elevated">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isSomeSelected}
                      onChange={(e) => onSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Specialty</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Fee</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Verification</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {doctors.map((doctor, index) => (
                    <TableRow
                      key={doctor.id}
                      component={motion.tr}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      hover
                      sx={{
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedDoctors.includes(doctor.id)}
                          onChange={() => onSelectDoctor(doctor.id)}
                        />
                      </TableCell>
                      <TableCell>{doctor.id}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar src={doctor.avatarUrl} sx={{ width: 40, height: 40 }}>
                            {doctor.user?.firstName?.[0]}{doctor.user?.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {doctor.user?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>{doctor.experienceYears} years</TableCell>
                      <TableCell>₹{doctor.consultationFee}</TableCell>
                      <TableCell>{doctor.location || 'N/A'}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Rating value={doctor.rating || 0} readOnly size="small" precision={0.1} />
                          <Typography variant="caption">
                            ({doctor.rating?.toFixed(1) || '0.0'})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {doctor.isVerified ? (
                          <Chip
                            label="Verified"
                            size="small"
                            color="success"
                            icon={<VerifiedUser />}
                          />
                        ) : (
                          <Chip
                            label="Pending"
                            size="small"
                            color="warning"
                            icon={<Pending />}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={doctor.isAvailable ? 'Available' : 'Unavailable'}
                          size="small"
                          color={doctor.isAvailable ? 'success' : 'default'}
                          icon={doctor.isAvailable ? <CheckCircle /> : <Block />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, doctor)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
        </ModernCard>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <Visibility sx={{ mr: 1 }} /> View Profile
        </MenuItem>
        <MenuItem onClick={() => handleAction('toggleAvailability')}>
          {selectedDoctor?.isAvailable ? (
            <>
              <Block sx={{ mr: 1 }} /> Mark Unavailable
            </>
          ) : (
            <>
              <CheckCircle sx={{ mr: 1 }} /> Mark Available
            </>
          )}
        </MenuItem>
        {!selectedDoctor?.isVerified && (
          <MenuItem onClick={() => handleAction('verify')}>
            <VerifiedUser sx={{ mr: 1 }} /> Verify Doctor
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default DoctorManagementGrid;
