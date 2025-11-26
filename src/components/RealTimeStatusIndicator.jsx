import { Box, Chip, Tooltip, Typography } from '@mui/material';
import {
  Wifi as ConnectedIcon,
  WifiOff as DisconnectedIcon,
  Sync as SyncingIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useRealTimeSync } from '../contexts/RealTimeSyncContext';
import { formatDistanceToNow } from 'date-fns';

const RealTimeStatusIndicator = ({ variant = 'chip' }) => {
  const { syncStatus, lastSyncTime } = useRealTimeSync();

  const getStatusConfig = () => {
    switch (syncStatus) {
      case 'connected':
        return {
          label: 'Connected',
          color: 'success',
          icon: <ConnectedIcon />,
        };
      case 'syncing':
        return {
          label: 'Syncing',
          color: 'info',
          icon: <SyncingIcon />,
        };
      case 'error':
        return {
          label: 'Connection Error',
          color: 'error',
          icon: <ErrorIcon />,
        };
      case 'disconnected':
      default:
        return {
          label: 'Disconnected',
          color: 'default',
          icon: <DisconnectedIcon />,
        };
    }
  };

  const statusConfig = getStatusConfig();

  const getTooltipContent = () => {
    let content = `Status: ${statusConfig.label}`;
    
    if (lastSyncTime) {
      const timeAgo = formatDistanceToNow(lastSyncTime, { addSuffix: true });
      content += `\nLast sync: ${timeAgo}`;
    }
    
    return content;
  };

  if (variant === 'minimal') {
    return (
      <Tooltip title={getTooltipContent()}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 
              statusConfig.color === 'success' ? 'success.main' :
              statusConfig.color === 'info' ? 'info.main' :
              statusConfig.color === 'error' ? 'error.main' :
              'grey.400',
            animation: syncStatus === 'syncing' ? 'pulse 1.5s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            },
          }}
        />
      </Tooltip>
    );
  }

  if (variant === 'detailed') {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          sx={{
            color: 
              statusConfig.color === 'success' ? 'success.main' :
              statusConfig.color === 'info' ? 'info.main' :
              statusConfig.color === 'error' ? 'error.main' :
              'grey.500',
            display: 'flex',
            alignItems: 'center',
            animation: syncStatus === 'syncing' ? 'spin 2s linear infinite' : 'none',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        >
          {statusConfig.icon}
        </Box>
        <Box>
          <Typography variant="caption" display="block">
            {statusConfig.label}
          </Typography>
          {lastSyncTime && (
            <Typography variant="caption" color="text.secondary" display="block">
              {formatDistanceToNow(lastSyncTime, { addSuffix: true })}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  // Default chip variant
  return (
    <Tooltip title={getTooltipContent()}>
      <Chip
        icon={statusConfig.icon}
        label={statusConfig.label}
        color={statusConfig.color}
        size="small"
        variant="outlined"
        sx={{
          animation: syncStatus === 'syncing' ? 'pulse 1.5s infinite' : 'none',
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.7 },
            '100%': { opacity: 1 },
          },
        }}
      />
    </Tooltip>
  );
};

export default RealTimeStatusIndicator;