import { memo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  School,
  Verified,
  Pending,
  Cancel,
  Description,
  Close,
  CalendarToday,
  Business,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { staggerContainer, staggerItem, getAccessibleVariants } from '../../../theme/animations';
import ModernCard from '../../common/ModernCard';

const DoctorCredentialsSection = memo(({ credentials = [], viewMode = 'grid' }) => {
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Get verification status details
  const getStatusDetails = (status) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
        return {
          icon: <Verified />,
          color: 'success',
          label: 'Verified',
          bgcolor: 'success.50',
          borderColor: 'success.200',
        };
      case 'PENDING':
        return {
          icon: <Pending />,
          color: 'warning',
          label: 'Pending Verification',
          bgcolor: 'warning.50',
          borderColor: 'warning.200',
        };
      case 'REJECTED':
        return {
          icon: <Cancel />,
          color: 'error',
          label: 'Rejected',
          bgcolor: 'error.50',
          borderColor: 'error.200',
        };
      default:
        return {
          icon: <Pending />,
          color: 'default',
          label: 'Unknown',
          bgcolor: 'grey.50',
          borderColor: 'grey.200',
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle credential click
  const handleCredentialClick = (credential) => {
    setSelectedCredential(credential);
    setViewerOpen(true);
  };

  // Handle close viewer
  const handleCloseViewer = () => {
    setViewerOpen(false);
    setTimeout(() => setSelectedCredential(null), 200);
  };

  // Render grid view
  const renderGridView = () => (
    <Box
      component={motion.div}
      variants={getAccessibleVariants(staggerContainer, prefersReducedMotion)}
      initial="initial"
      animate="animate"
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
        gap: 3,
      }}
    >
      {credentials.map((credential, index) => {
        const statusDetails = getStatusDetails(credential.verificationStatus);
        
        return (
          <ModernCard
            key={credential.id || index}
            component={motion.div}
            variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
            hover
            sx={{
              cursor: 'pointer',
              height: '100%',
            }}
            onClick={() => handleCredentialClick(credential)}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Header */}
              <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                <School sx={{ fontSize: 32, color: 'primary.main' }} />
                <Chip
                  icon={statusDetails.icon}
                  label={statusDetails.label}
                  color={statusDetails.color}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {/* Credential Type */}
              <Typography
                variant="h6"
                fontWeight={700}
                gutterBottom
                sx={{
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                {credential.credentialType || 'Credential'}
              </Typography>

              {/* Issuing Authority */}
              {credential.issuingAuthority && (
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Business sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {credential.issuingAuthority}
                  </Typography>
                </Box>
              )}

              {/* Issue Date */}
              {credential.issueDate && (
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Issued: {formatDate(credential.issueDate)}
                  </Typography>
                </Box>
              )}

              {/* Expiry Date */}
              {credential.expiryDate && (
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Expires: {formatDate(credential.expiryDate)}
                  </Typography>
                </Box>
              )}

              {/* Document indicator */}
              {credential.documentUrl && (
                <Box
                  sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Description sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="body2" color="primary.main" fontWeight={600}>
                      View Document
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </ModernCard>
        );
      })}
    </Box>
  );

  // Render timeline view (simplified list view)
  const renderTimelineView = () => (
    <Stack spacing={2}>
      {credentials.map((credential, index) => {
        const statusDetails = getStatusDetails(credential.verificationStatus);

        return (
          <Box key={credential.id || index} sx={{ position: 'relative', pl: { xs: 0, md: 4 } }}>
            {/* Timeline indicator */}
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: index === credentials.length - 1 ? '50%' : 0,
                width: 2,
                bgcolor: 'divider',
              }}
            />
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                position: 'absolute',
                left: -10,
                top: 20,
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: `${statusDetails.color}.main`,
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 14,
                boxShadow: 2,
              }}
            >
              {statusDetails.icon}
            </Box>

            <ModernCard
              hover
              sx={{
                cursor: 'pointer',
              }}
              onClick={() => handleCredentialClick(credential)}
            >
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1} gap={2}>
                  <Box flexGrow={1}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {credential.credentialType || 'Credential'}
                    </Typography>
                    {credential.issuingAuthority && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {credential.issuingAuthority}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={statusDetails.label}
                    color={statusDetails.color}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                <Box display="flex" gap={3} flexWrap="wrap" mt={1}>
                  {credential.issueDate && (
                    <Typography variant="caption" color="text.secondary">
                      Issued: {formatDate(credential.issueDate)}
                    </Typography>
                  )}
                  {credential.expiryDate && (
                    <Typography variant="caption" color="text.secondary">
                      Expires: {formatDate(credential.expiryDate)}
                    </Typography>
                  )}
                </Box>

                {credential.documentUrl && (
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <Description sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="caption" color="primary.main" fontWeight={600}>
                      View Document
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </ModernCard>
          </Box>
        );
      })}
    </Stack>
  );

  // Empty state
  if (!credentials || credentials.length === 0) {
    return (
      <ModernCard>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <School sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Credentials Added
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Professional credentials will be displayed here once added.
          </Typography>
        </CardContent>
      </ModernCard>
    );
  }

  return (
    <>
      {/* Credentials Display */}
      {viewMode === 'timeline' ? renderTimelineView() : renderGridView()}

      {/* Document Viewer Dialog */}
      <Dialog
        open={viewerOpen}
        onClose={handleCloseViewer}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700}>
              Credential Details
            </Typography>
            <IconButton onClick={handleCloseViewer} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 3 }}>
          {selectedCredential && (
            <Stack spacing={3}>
              {/* Status */}
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Verification Status
                </Typography>
                <Chip
                  icon={getStatusDetails(selectedCredential.verificationStatus).icon}
                  label={getStatusDetails(selectedCredential.verificationStatus).label}
                  color={getStatusDetails(selectedCredential.verificationStatus).color}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {/* Credential Type */}
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Credential Type
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedCredential.credentialType || 'N/A'}
                </Typography>
              </Box>

              {/* Issuing Authority */}
              {selectedCredential.issuingAuthority && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    Issuing Authority
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedCredential.issuingAuthority}
                  </Typography>
                </Box>
              )}

              {/* Dates */}
              <Box display="flex" gap={3}>
                {selectedCredential.issueDate && (
                  <Box flexGrow={1}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      Issue Date
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatDate(selectedCredential.issueDate)}
                    </Typography>
                  </Box>
                )}
                {selectedCredential.expiryDate && (
                  <Box flexGrow={1}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      Expiry Date
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatDate(selectedCredential.expiryDate)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Document */}
              {selectedCredential.documentUrl && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    Document
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Description sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Box flexGrow={1}>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedCredential.documentName || 'Credential Document'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Click to view or download
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      href={selectedCredential.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </Button>
                  </Box>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseViewer} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

DoctorCredentialsSection.displayName = 'DoctorCredentialsSection';

export default DoctorCredentialsSection;
