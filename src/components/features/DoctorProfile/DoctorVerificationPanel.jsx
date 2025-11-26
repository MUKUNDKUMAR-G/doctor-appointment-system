import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Alert,
} from '@mui/material';
import {
  VerifiedUser,
  Cancel,
  Visibility,
  Download,
  Description,
  CheckCircle,
  Error,
  Pending,
} from '@mui/icons-material';
import api from '../../../services/api';

const DoctorVerificationPanel = ({ pendingVerifications, onVerify, onRefresh }) => {
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleViewCredential = (credential) => {
    setSelectedCredential(credential);
    setViewDialogOpen(true);
  };

  const handleOpenActionDialog = (credential, type) => {
    setSelectedCredential(credential);
    setActionType(type);
    setNotes('');
    setActionDialogOpen(true);
  };

  const handleApprove = async () => {
    try {
      await api.put(`/api/admin/credentials/${selectedCredential.id}/verify`, {
        status: 'VERIFIED',
        notes: notes,
      });
      setSuccess('Credential verified successfully');
      setActionDialogOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Error verifying credential:', err);
      setError('Failed to verify credential');
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      await api.put(`/api/admin/credentials/${selectedCredential.id}/verify`, {
        status: 'REJECTED',
        notes: notes,
      });
      setSuccess('Credential rejected');
      setActionDialogOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Error rejecting credential:', err);
      setError('Failed to reject credential');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle color="success" />;
      case 'REJECTED':
        return <Error color="error" />;
      case 'PENDING':
      default:
        return <Pending color="warning" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
      default:
        return 'warning';
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {pendingVerifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <VerifiedUser sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No pending verifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All credentials have been reviewed
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {pendingVerifications.map((verification) => (
            <Grid item xs={12} md={6} lg={4} key={verification.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar src={verification.doctor?.avatarUrl}>
                      {verification.doctor?.user?.firstName?.[0]}
                      {verification.doctor?.user?.lastName?.[0]}
                    </Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Dr. {verification.doctor?.user?.firstName}{' '}
                        {verification.doctor?.user?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {verification.doctor?.specialty}
                      </Typography>
                    </Box>
                    <Chip
                      label={verification.verificationStatus}
                      size="small"
                      color={getStatusColor(verification.verificationStatus)}
                      icon={getStatusIcon(verification.verificationStatus)}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Credential Type"
                        secondary={verification.credentialType}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Issuing Authority"
                        secondary={verification.issuingAuthority || 'N/A'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Issue Date"
                        secondary={
                          verification.issueDate
                            ? new Date(verification.issueDate).toLocaleDateString()
                            : 'N/A'
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Expiry Date"
                        secondary={
                          verification.expiryDate
                            ? new Date(verification.expiryDate).toLocaleDateString()
                            : 'N/A'
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Uploaded"
                        secondary={new Date(verification.uploadedAt).toLocaleDateString()}
                      />
                    </ListItem>
                  </List>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleViewCredential(verification)}
                  >
                    View
                  </Button>
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => handleOpenActionDialog(verification, 'reject')}
                    >
                      Reject
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<VerifiedUser />}
                      onClick={() => handleOpenActionDialog(verification, 'approve')}
                    >
                      Approve
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* View Credential Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Credential Details</Typography>
            <IconButton
              href={selectedCredential?.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <Download />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCredential && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar src={selectedCredential.doctor?.avatarUrl} sx={{ width: 56, height: 56 }}>
                  {selectedCredential.doctor?.user?.firstName?.[0]}
                  {selectedCredential.doctor?.user?.lastName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    Dr. {selectedCredential.doctor?.user?.firstName}{' '}
                    {selectedCredential.doctor?.user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCredential.doctor?.specialty}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Credential Type
                  </Typography>
                  <Typography variant="body1">{selectedCredential.credentialType}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box mt={0.5}>
                    <Chip
                      label={selectedCredential.verificationStatus}
                      size="small"
                      color={getStatusColor(selectedCredential.verificationStatus)}
                      icon={getStatusIcon(selectedCredential.verificationStatus)}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Issuing Authority
                  </Typography>
                  <Typography variant="body1">
                    {selectedCredential.issuingAuthority || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Document Name
                  </Typography>
                  <Typography variant="body1">
                    {selectedCredential.documentName || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Issue Date
                  </Typography>
                  <Typography variant="body1">
                    {selectedCredential.issueDate
                      ? new Date(selectedCredential.issueDate).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Expiry Date
                  </Typography>
                  <Typography variant="body1">
                    {selectedCredential.expiryDate
                      ? new Date(selectedCredential.expiryDate).toLocaleDateString()
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Uploaded At
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedCredential.uploadedAt).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              {selectedCredential.documentUrl && (
                <Box mt={3}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Document Preview
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      mt: 1,
                      textAlign: 'center',
                      bgcolor: 'grey.100',
                    }}
                  >
                    {selectedCredential.documentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img
                        src={selectedCredential.documentUrl}
                        alt="Credential document"
                        style={{ maxWidth: '100%', maxHeight: '400px' }}
                      />
                    ) : (
                      <Box py={4}>
                        <Description sx={{ fontSize: 64, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" mt={2}>
                          Document preview not available
                        </Typography>
                        <Button
                          href={selectedCredential.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<Download />}
                          sx={{ mt: 2 }}
                        >
                          Download Document
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog (Approve/Reject) */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Credential' : 'Reject Credential'}
        </DialogTitle>
        <DialogContent>
          {selectedCredential && (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Dr. {selectedCredential.doctor?.user?.firstName}{' '}
                {selectedCredential.doctor?.user?.lastName} -{' '}
                {selectedCredential.credentialType}
              </Typography>

              <TextField
                label={actionType === 'approve' ? 'Verification Notes (Optional)' : 'Rejection Reason (Required)'}
                multiline
                rows={4}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  actionType === 'approve'
                    ? 'Add any notes about this verification...'
                    : 'Please provide a reason for rejection...'
                }
                required={actionType === 'reject'}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={actionType === 'approve' ? handleApprove : handleReject}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorVerificationPanel;
