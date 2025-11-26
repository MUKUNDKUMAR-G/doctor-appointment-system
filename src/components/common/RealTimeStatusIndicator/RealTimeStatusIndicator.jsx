import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { Wifi, WifiOff, Sync } from '@mui/icons-material';
import { useAdminRealTime } from '../../../contexts/AdminRealTimeContext';

/**
 * Real-time connection status indicator for admin pages
 * Shows WebSocket connection status with appropriate icon and color
 */
const RealTimeStatusIndicator = () => {
  const { connectionStatus, isPolling } = useAdminRealTime();

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi />,
          label: 'Live Updates',
          color: 'success',
          tooltip: 'Connected to real-time updates via WebSocket',
        };
      case 'reconnecting':
        return {
          icon: <Sync className="animate-spin" />,
          label: 'Reconnecting...',
          color: 'warning',
          tooltip: 'Attempting to reconnect to WebSocket server',
        };
      case 'failed':
      case 'disconnected':
        return {
          icon: <WifiOff />,
          label: isPolling ? 'Polling Mode' : 'Disconnected',
          color: 'default',
          tooltip: isPolling 
            ? 'Using polling fallback for updates (every 30 seconds)'
            : 'Not connected to real-time updates',
        };
      default:
        return {
          icon: <WifiOff />,
          label: 'Connecting...',
          color: 'default',
          tooltip: 'Initializing connection',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Tooltip title={config.tooltip} arrow>
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        sx={{ 
          fontWeight: 600,
          '& .animate-spin': {
            animation: 'spin 1s linear infinite',
          },
          '@keyframes spin': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
          },
        }}
      />
    </Tooltip>
  );
};

export default RealTimeStatusIndicator;
