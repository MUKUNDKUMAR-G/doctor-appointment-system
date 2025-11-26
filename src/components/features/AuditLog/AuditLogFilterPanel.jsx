import React, { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Grid,
  InputAdornment,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion } from 'framer-motion';

const actionTypes = [
  'USER_CREATED',
  'USER_UPDATED',
  'USER_DELETED',
  'USER_ENABLED',
  'USER_DISABLED',
  'DOCTOR_CREATED',
  'DOCTOR_UPDATED',
  'DOCTOR_DELETED',
  'DOCTOR_VERIFIED',
  'DOCTOR_REJECTED',
  'APPOINTMENT_CREATED',
  'APPOINTMENT_UPDATED',
  'APPOINTMENT_CANCELLED',
  'REVIEW_APPROVED',
  'REVIEW_REJECTED',
  'SETTINGS_UPDATED',
  'BULK_OPERATION',
];

const severityLevels = ['INFO', 'WARNING', 'ERROR', 'CRITICAL'];

const entityTypes = [
  'USER',
  'DOCTOR',
  'APPOINTMENT',
  'REVIEW',
  'SETTINGS',
  'SYSTEM',
];

const AuditLogFilterPanel = ({
  filters,
  onFilterChange,
  onFiltersChange,
  onClearFilters,
  onClearFilter,
  isFilterActive,
  activeFilterCount,
  searchTerm,
  onSearch,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [localSearch, setLocalSearch] = useState(searchTerm || '');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    // Debounce search
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  let searchTimeout;

  const handleDateChange = (field, value) => {
    if (value) {
      // Format date as YYYY-MM-DD
      const formattedDate = value.toISOString().split('T')[0];
      onFilterChange(field, formattedDate);
    } else {
      onClearFilter(field);
    }
  };

  const getActiveFilters = () => {
    const active = [];
    if (filters.startDate) active.push({ key: 'startDate', label: `From: ${filters.startDate}` });
    if (filters.endDate) active.push({ key: 'endDate', label: `To: ${filters.endDate}` });
    if (filters.action) active.push({ key: 'action', label: `Action: ${filters.action}` });
    if (filters.severity) active.push({ key: 'severity', label: `Severity: ${filters.severity}` });
    if (filters.entityType) active.push({ key: 'entityType', label: `Entity: ${filters.entityType}` });
    if (filters.adminId) active.push({ key: 'adminId', label: `Admin ID: ${filters.adminId}` });
    if (filters.search) active.push({ key: 'search', label: `Search: ${filters.search}` });
    return active;
  };

  const activeFilters = getActiveFilters();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <FilterList color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
          {activeFilterCount > 0 && (
            <Chip
              label={activeFilterCount}
              size="small"
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
        <Box display="flex" gap={1}>
          {activeFilterCount > 0 && (
            <Button
              size="small"
              startIcon={<Clear />}
              onClick={onClearFilters}
            >
              Clear All
            </Button>
          )}
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {activeFilters.map((filter) => (
            <motion.div
              key={filter.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Chip
                label={filter.label}
                onDelete={() => onClearFilter(filter.key)}
                color="primary"
                variant="outlined"
              />
            </motion.div>
          ))}
        </Box>
      )}

      {/* Filter Controls */}
      <Collapse in={expanded}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2}>
            {/* Search */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Search audit logs..."
                value={localSearch}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: localSearch && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setLocalSearch('');
                          onSearch('');
                        }}
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={filters.startDate ? new Date(filters.startDate) : null}
                onChange={(value) => handleDateChange('startDate', value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={filters.endDate ? new Date(filters.endDate) : null}
                onChange={(value) => handleDateChange('endDate', value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>

            {/* Action Type */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Action Type</InputLabel>
                <Select
                  value={filters.action || ''}
                  label="Action Type"
                  onChange={(e) => onFilterChange('action', e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Actions</em>
                  </MenuItem>
                  {actionTypes.map((action) => (
                    <MenuItem key={action} value={action}>
                      {action.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Severity */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Severity</InputLabel>
                <Select
                  value={filters.severity || ''}
                  label="Severity"
                  onChange={(e) => onFilterChange('severity', e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Severities</em>
                  </MenuItem>
                  {severityLevels.map((severity) => (
                    <MenuItem key={severity} value={severity}>
                      {severity}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Entity Type */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Entity Type</InputLabel>
                <Select
                  value={filters.entityType || ''}
                  label="Entity Type"
                  onChange={(e) => onFilterChange('entityType', e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Entities</em>
                  </MenuItem>
                  {entityTypes.map((entity) => (
                    <MenuItem key={entity} value={entity}>
                      {entity}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Admin ID */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Admin ID"
                type="number"
                value={filters.adminId || ''}
                onChange={(e) => onFilterChange('adminId', e.target.value)}
                placeholder="Filter by admin ID"
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Collapse>
    </Box>
  );
};

export default AuditLogFilterPanel;
