import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  HourglassEmpty,
  CloudDownload,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { colors } from '../../../theme/colors';

const ProgressContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: '12px',
  backgroundColor: colors.grey[50],
  border: `1px solid ${colors.grey[200]}`,
}));

const StatusIcon = styled(Box)(({ status }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: 
    status === 'complete' ? colors.success.light :
    status === 'error' ? colors.error.light :
    colors.primary.light,
  color: 
    status === 'complete' ? colors.success.main :
    status === 'error' ? colors.error.main :
    colors.primary.main,
}));

const getStatusIcon = (status) => {
  switch (status) {
    case 'preparing':
      return <HourglassEmpty />;
    case 'downloading':
      return <CloudDownload />;
    case 'complete':
      return <CheckCircle />;
    case 'error':
      return <Error />;
    case 'retrying':
      return <HourglassEmpty />;
    default:
      return <HourglassEmpty />;
  }
};

/**
 * ExportProgressIndicator - Visual indicator for export progress
 * 
 * @param {Object} progress - Progress object with status and message
 * @param {boolean} show - Whether to show the indicator
 * @param {Function} onClose - Callback when indicator is closed
 */
const ExportProgressIndicator = ({ progress, show = false, onClose }) => {
  if (!show || !progress) {
    return null;
  }

  const { status, message } = progress;
  const isLoading = status === 'preparing' || status === 'downloading' || status === 'retrying';
  const isComplete = status === 'complete';
  const isError = status === 'error';

  return (
    <Snackbar
      open={show}
      autoHideDuration={isComplete ? 3000 : null}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        severity={isError ? 'error' : isComplete ? 'success' : 'info'}
        onClose={onClose}
        sx={{
          width: '100%',
          minWidth: 300,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: isLoading ? 1 : 0 }}>
          <StatusIcon status={status}>
            {getStatusIcon(status)}
          </StatusIcon>
          <Typography variant="body2" sx={{ flex: 1 }}>
            {message}
          </Typography>
        </Box>
        {isLoading && (
          <LinearProgress
            sx={{
              mt: 1,
              borderRadius: 1,
              backgroundColor: colors.grey[200],
              '& .MuiLinearProgress-bar': {
                backgroundColor: colors.primary.main,
              },
            }}
          />
        )}
      </Alert>
    </Snackbar>
  );
};

export default ExportProgressIndicator;
