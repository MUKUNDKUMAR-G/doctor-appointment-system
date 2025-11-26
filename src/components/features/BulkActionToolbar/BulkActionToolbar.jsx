import React from 'react';
import { Box, Typography, Button, Chip, Slide } from '@mui/material';
import { Close, CheckCircle } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { colors } from '../../../theme/colors';

const ToolbarContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  borderRadius: '16px',
  padding: theme.spacing(2, 3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  minWidth: '400px',
  maxWidth: '90vw',
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    width: '90vw',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
  },
}));

const InfoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  flex: 1,
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'center',
  },
}));

const SelectionChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '0.875rem',
  '& .MuiChip-label': {
    padding: theme.spacing(0.5, 1.5),
  },
}));

const SelectionText = styled(Typography)(({ theme }) => ({
  color: '#ffffff',
  fontSize: '0.95rem',
  fontWeight: 500,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.875rem',
  },
}));

const ActionsSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  color: colors.primary.main,
  fontWeight: 600,
  padding: theme.spacing(0.75, 2),
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '0.875rem',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#ffffff',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  '&:disabled': {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    color: 'rgba(0, 0, 0, 0.3)',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
    padding: theme.spacing(0.5, 1.5),
  },
}));

const CloseButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(0.5),
  color: '#ffffff',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

/**
 * BulkActionToolbar - Floating toolbar for bulk operations
 * 
 * @param {number} selectedCount - Number of selected items
 * @param {Array} actions - Array of action objects with { label, onClick, icon, disabled }
 * @param {Function} onClear - Callback to clear selection
 * @param {boolean} isProcessing - Whether bulk action is in progress
 */
const BulkActionToolbar = ({ 
  selectedCount, 
  actions = [], 
  onClear, 
  isProcessing = false 
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <Slide direction="up" in={selectedCount > 0} mountOnEnter unmountOnExit>
      <ToolbarContainer role="toolbar" aria-label="Bulk actions toolbar">
        <InfoSection>
          <SelectionChip 
            label={selectedCount} 
            icon={<CheckCircle />}
            aria-label={`${selectedCount} items selected`}
          />
          <SelectionText>
            {selectedCount === 1 ? 'item selected' : 'items selected'}
          </SelectionText>
        </InfoSection>
        
        <ActionsSection>
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <ActionButton
                key={index}
                onClick={action.onClick}
                disabled={action.disabled || isProcessing}
                startIcon={Icon && <Icon />}
                aria-label={action.label}
              >
                {action.label}
              </ActionButton>
            );
          })}
        </ActionsSection>
        
        <CloseButton
          onClick={onClear}
          disabled={isProcessing}
          aria-label="Clear selection"
        >
          <Close />
        </CloseButton>
      </ToolbarContainer>
    </Slide>
  );
};

export default BulkActionToolbar;
