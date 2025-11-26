import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Info,
  Warning,
  Error as ErrorIcon,
  CrisisAlert,
  Person,
  AccessTime,
  Computer,
  Description,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { colors } from '../../../theme/colors';

const severityConfig = {
  INFO: {
    color: colors.info.main,
    bgColor: colors.info.light,
    icon: <Info />,
    label: 'Info',
  },
  WARNING: {
    color: colors.warning.main,
    bgColor: colors.warning.light,
    icon: <Warning />,
    label: 'Warning',
  },
  ERROR: {
    color: colors.error.main,
    bgColor: colors.error.light,
    icon: <ErrorIcon />,
    label: 'Error',
  },
  CRITICAL: {
    color: '#d32f2f',
    bgColor: '#ffebee',
    icon: <CrisisAlert />,
    label: 'Critical',
  },
};

const AuditLogEntry = ({ log, index }) => {
  const severity = severityConfig[log.severity] || severityConfig.INFO;
  const timestamp = log.timestamp ? new Date(log.timestamp) : new Date();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderLeft: `4px solid ${severity.color}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 3,
            transform: 'translateX(4px)',
          },
        }}
      >
        <Box display="flex" alignItems="flex-start" gap={2}>
          {/* Severity Icon */}
          <Avatar
            sx={{
              bgcolor: severity.bgColor,
              color: severity.color,
              width: 48,
              height: 48,
            }}
          >
            {severity.icon}
          </Avatar>

          {/* Content */}
          <Box flex={1}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {log.action}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Chip
                    label={severity.label}
                    size="small"
                    sx={{
                      bgcolor: severity.bgColor,
                      color: severity.color,
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={log.entityType}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
              <Tooltip title={format(timestamp, 'PPpp')}>
                <Chip
                  icon={<AccessTime />}
                  label={format(timestamp, 'MMM dd, yyyy HH:mm')}
                  size="small"
                  variant="outlined"
                />
              </Tooltip>
            </Box>

            {/* Details */}
            {log.details && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Description fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight={600}>
                    Details
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {log.details}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Footer */}
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {log.adminName}
                  </Typography>
                </Box>
                {log.ipAddress && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Computer fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {log.ipAddress}
                    </Typography>
                  </Box>
                )}
              </Box>
              {log.entityId && (
                <Typography variant="body2" color="text.secondary">
                  Entity ID: {log.entityId}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

const AuditLogTimeline = ({
  logs,
  loading,
  pagination,
  onPageChange,
  onNextPage,
  onPreviousPage,
  onPageSizeChange,
  hasNextPage,
  hasPreviousPage,
}) => {
  if (!logs || logs.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No audit logs found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Try adjusting your filters or search criteria
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Timeline Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Activity Timeline ({pagination.totalElements || logs.length} entries)
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Per Page</InputLabel>
          <Select
            value={pagination.size || 20}
            label="Per Page"
            onChange={(e) => onPageSizeChange(e.target.value)}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Timeline Entries */}
      <AnimatePresence mode="wait">
        {logs.map((log, index) => (
          <AuditLogEntry key={log.id} log={log} index={index} />
        ))}
      </AnimatePresence>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page + 1}
            onChange={(e, page) => onPageChange(page - 1)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default AuditLogTimeline;
