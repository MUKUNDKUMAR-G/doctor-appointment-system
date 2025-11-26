import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Box,
} from '@mui/material';
import {
  FileDownload,
  Description,
  TableChart,
  PictureAsPdf,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { colors } from '../../../theme/colors';

const ExportButtonStyled = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  color: '#ffffff',
  fontWeight: 600,
  padding: theme.spacing(1, 2.5),
  borderRadius: '10px',
  textTransform: 'none',
  fontSize: '0.9rem',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  },
  '&:disabled': {
    background: colors.grey[300],
    color: colors.grey[500],
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '12px',
    marginTop: theme.spacing(1),
    minWidth: 200,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    border: `1px solid ${colors.grey[200]}`,
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: colors.primary[50],
    '& .MuiListItemIcon-root': {
      color: colors.primary.main,
    },
  },
}));

const formatIcons = {
  csv: TableChart,
  excel: Description,
  pdf: PictureAsPdf,
};

/**
 * ExportButton - Button with dropdown for export format selection
 * 
 * @param {Function} onExport - Callback function (format) => void
 * @param {Array} formats - Array of format strings ['csv', 'excel', 'pdf']
 * @param {boolean} disabled - Whether button is disabled
 * @param {boolean} loading - Whether export is in progress
 * @param {string} label - Button label text
 * @param {Object} progress - Progress object with status and message
 */
const ExportButton = ({
  onExport,
  formats = ['csv', 'excel', 'pdf'],
  disabled = false,
  loading = false,
  label = 'Export',
  progress = null,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (format) => {
    handleClose();
    onExport(format);
  };

  const formatLabels = {
    csv: 'Export as CSV',
    excel: 'Export as Excel',
    pdf: 'Export as PDF',
  };

  // Determine button text based on progress
  const getButtonText = () => {
    if (progress) {
      switch (progress.status) {
        case 'preparing':
          return 'Preparing...';
        case 'downloading':
          return 'Downloading...';
        case 'complete':
          return 'Complete!';
        case 'error':
          return 'Export Failed';
        default:
          return label;
      }
    }
    return loading ? 'Exporting...' : label;
  };

  return (
    <Box>
      <ExportButtonStyled
        onClick={handleClick}
        disabled={disabled || loading}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <FileDownload />}
        aria-controls={open ? 'export-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label="Export data"
      >
        {getButtonText()}
      </ExportButtonStyled>
      
      <StyledMenu
        id="export-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'export-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {formats.map((format) => {
          const Icon = formatIcons[format];
          return (
            <StyledMenuItem
              key={format}
              onClick={() => handleExport(format)}
              aria-label={formatLabels[format]}
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{formatLabels[format]}</ListItemText>
            </StyledMenuItem>
          );
        })}
      </StyledMenu>
    </Box>
  );
};

export default ExportButton;
