import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Collapse,
  Alert,
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Block,
  Delete,
  PersonAdd,
  MoreVert,
} from '@mui/icons-material';

/**
 * UserBulkActionsPanel Component
 * Panel for performing bulk operations on selected users
 * 
 * @param {number} selectedCount - Number of selected users
 * @param {Function} onBulkAction - Callback for bulk actions
 * @param {Function} onClearSelection - Callback to clear selection
 * @param {boolean} isProcessing - Whether a bulk action is in progress
 * @param {Object} processingProgress - Progress information {current, total}
 */
const UserBulkActionsPanel = ({
  selectedCount = 0,
  onBulkAction,
  onClearSelection,
  isProcessing = false,
  processingProgress = null,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showProgress, setShowProgress] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBulkAction = async (action) => {
    handleMenuClose();
    setShowProgress(true);
    try {
      await onBulkAction(action);
    } finally {
      setShowProgress(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <Collapse in={selectedCount > 0}>
      <Paper
        elevation={3}
        sx={{
          position: 'sticky',
          top: 16,
          zIndex: 10,
          p: 2,
          mb: 3,
          backgroundColor: 'primary.50',
          borderLeft: 4,
          borderColor: 'primary.main',
        }}
        role="region"
        aria-label="Bulk actions panel"
      >
        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
          {/* Selection Info */}
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip
                label={`${selectedCount} selected`}
                color="primary"
                size="small"
                aria-label={`${selectedCount} users selected`}
              />
              {isProcessing && processingProgress && (
                <Typography variant="body2" color="text.secondary">
                  Processing {processingProgress.current} of {processingProgress.total}...
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Action Buttons */}
          {!isProcessing && (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<CheckCircle />}
                onClick={() => handleBulkAction('enable')}
                aria-label="Enable selected users"
              >
                Enable
              </Button>

              <Button
                variant="contained"
                color="warning"
                size="small"
                startIcon={<Block />}
                onClick={() => handleBulkAction('disable')}
                aria-label="Disable selected users"
              >
                Disable
              </Button>

              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<Delete />}
                onClick={() => handleBulkAction('delete')}
                aria-label="Delete selected users"
              >
                Delete
              </Button>

              <IconButton
                size="small"
                onClick={handleMenuOpen}
                aria-label="More bulk actions"
                aria-controls="bulk-actions-menu"
                aria-haspopup="true"
              >
                <MoreVert />
              </IconButton>

              <Menu
                id="bulk-actions-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => handleBulkAction('change-role-patient')}>
                  Change Role to Patient
                </MenuItem>
                <MenuItem onClick={() => handleBulkAction('change-role-doctor')}>
                  Change Role to Doctor
                </MenuItem>
              </Menu>
            </Stack>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <CircularProgress size={24} aria-label="Processing bulk action" />
          )}

          {/* Clear Selection */}
          <IconButton
            size="small"
            onClick={onClearSelection}
            disabled={isProcessing}
            aria-label="Clear selection"
          >
            <Close />
          </IconButton>
        </Stack>

        {/* Progress Alert */}
        {showProgress && processingProgress && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Processing {processingProgress.current} of {processingProgress.total} users...
          </Alert>
        )}
      </Paper>
    </Collapse>
  );
};

export default UserBulkActionsPanel;
