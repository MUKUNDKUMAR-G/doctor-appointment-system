import { useState } from 'react';
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
  Rating,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Flag,
  CheckCircle,
  Delete,
  Visibility,
  Close,
  Warning,
} from '@mui/icons-material';
import api from '../../../services/api';

const ReviewModerationPanel = ({ flaggedReviews, onRefresh }) => {
  const [selectedReview, setSelectedReview] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };

  const handleOpenActionDialog = (review, type) => {
    setSelectedReview(review);
    setActionType(type);
    setModerationNotes('');
    setActionDialogOpen(true);
  };

  const handleApproveReview = async () => {
    try {
      await api.put(`/admin/reviews/${selectedReview.id}/moderate`, {
        action: 'APPROVE',
        notes: moderationNotes,
      });
      setSuccess('Review approved successfully');
      setActionDialogOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Error approving review:', err);
      setError('Failed to approve review');
    }
  };

  const handleRemoveReview = async () => {
    if (!moderationNotes.trim()) {
      setError('Please provide a reason for removal');
      return;
    }

    try {
      await api.delete(`/admin/reviews/${selectedReview.id}`, {
        data: { reason: moderationNotes },
      });
      setSuccess('Review removed successfully');
      setActionDialogOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Error removing review:', err);
      setError('Failed to remove review');
    }
  };

  const handleDismissFlag = async () => {
    try {
      await api.put(`/admin/reviews/${selectedReview.id}/dismiss-flag`, {
        notes: moderationNotes,
      });
      setSuccess('Flag dismissed successfully');
      setActionDialogOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Error dismissing flag:', err);
      setError('Failed to dismiss flag');
    }
  };

  const filteredReviews = flaggedReviews.filter((review) => {
    if (filterStatus === 'all') return true;
    return review.moderationStatus === filterStatus;
  });

  const getFlagSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
      default:
        return 'info';
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

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Flagged Reviews</Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filterStatus}
            label="Filter by Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REMOVED">Removed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredReviews.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No flagged reviews
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All reviews have been moderated
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredReviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" gap={2} flexGrow={1}>
                      <Avatar src={review.patient?.avatarUrl}>
                        {review.patient?.firstName?.[0]}
                        {review.patient?.lastName?.[0]}
                      </Avatar>
                      <Box flexGrow={1}>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {review.patient?.firstName} {review.patient?.lastName}
                          </Typography>
                          <Rating value={review.rating} readOnly size="small" />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Review for Dr. {review.doctor?.user?.firstName}{' '}
                          {review.doctor?.user?.lastName}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" gap={1} alignItems="center">
                      <Chip
                        label={review.flagSeverity || 'MEDIUM'}
                        size="small"
                        color={getFlagSeverityColor(review.flagSeverity)}
                        icon={<Flag />}
                      />
                      {review.moderationStatus && (
                        <Chip label={review.moderationStatus} size="small" variant="outlined" />
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {review.comment}
                  </Typography>

                  {review.flagReason && (
                    <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
                      <Typography variant="caption" fontWeight="bold">
                        Flag Reason:
                      </Typography>
                      <Typography variant="body2">{review.flagReason}</Typography>
                    </Alert>
                  )}

                  {review.doctorResponse && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ pl: 2, borderLeft: 3, borderColor: 'primary.main' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          Doctor's Response:
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {review.doctorResponse}
                        </Typography>
                      </Box>
                    </>
                  )}

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      Posted: {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleViewReview(review)}
                  >
                    View Details
                  </Button>
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Close />}
                      onClick={() => handleOpenActionDialog(review, 'dismiss')}
                    >
                      Dismiss Flag
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleOpenActionDialog(review, 'remove')}
                    >
                      Remove
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleOpenActionDialog(review, 'approve')}
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

      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Review Details</DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Patient
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Avatar src={selectedReview.patient?.avatarUrl} sx={{ width: 32, height: 32 }}>
                      {selectedReview.patient?.firstName?.[0]}
                    </Avatar>
                    <Typography variant="body1">
                      {selectedReview.patient?.firstName} {selectedReview.patient?.lastName}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Doctor
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Avatar src={selectedReview.doctor?.avatarUrl} sx={{ width: 32, height: 32 }}>
                      {selectedReview.doctor?.user?.firstName?.[0]}
                    </Avatar>
                    <Typography variant="body1">
                      Dr. {selectedReview.doctor?.user?.firstName}{' '}
                      {selectedReview.doctor?.user?.lastName}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Review Comment
                  </Typography>
                  <Paper sx={{ p: 2, mt: 0.5, bgcolor: 'grey.50' }}>
                    <Typography variant="body1">{selectedReview.comment}</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' && 'Approve Review'}
          {actionType === 'remove' && 'Remove Review'}
          {actionType === 'dismiss' && 'Dismiss Flag'}
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Review by {selectedReview.patient?.firstName} for Dr.{' '}
                {selectedReview.doctor?.user?.firstName}
              </Typography>

              <TextField
                label={
                  actionType === 'remove'
                    ? 'Removal Reason (Required)'
                    : 'Moderation Notes (Optional)'
                }
                multiline
                rows={4}
                fullWidth
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                required={actionType === 'remove'}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={
              actionType === 'approve'
                ? handleApproveReview
                : actionType === 'remove'
                ? handleRemoveReview
                : handleDismissFlag
            }
            variant="contained"
            color={
              actionType === 'approve' ? 'success' : actionType === 'remove' ? 'error' : 'primary'
            }
          >
            {actionType === 'approve' && 'Approve'}
            {actionType === 'remove' && 'Remove'}
            {actionType === 'dismiss' && 'Dismiss'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewModerationPanel;
