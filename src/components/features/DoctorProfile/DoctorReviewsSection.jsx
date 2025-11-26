import { memo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  Avatar,
  Stack,
  Chip,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Paper,
} from '@mui/material';
import {
  Star,
  FilterList,
  Sort,
  Reply,
  ThumbUp,
  VerifiedUser,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { staggerContainer, staggerItem, getAccessibleVariants } from '../../../theme/animations';
import ModernCard from '../../common/ModernCard';

const DoctorReviewsSection = memo(({
  reviews = [],
  totalReviews = 0,
  averageRating = 0,
  ratingDistribution = {},
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onFilterChange,
  onSortChange,
}) => {
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const prefersReducedMotion = useReducedMotion();

  // Ensure reviews is always an array
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  // Calculate rating distribution percentages
  const getRatingPercentage = (rating) => {
    if (!totalReviews || totalReviews === 0) return 0;
    const count = ratingDistribution[rating] || 0;
    return Math.round((count / totalReviews) * 100);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    const value = event.target.value;
    setFilterRating(value);
    if (onFilterChange) {
      onFilterChange(value);
    }
  };

  // Handle sort change
  const handleSortChange = (event) => {
    const value = event.target.value;
    setSortBy(value);
    if (onSortChange) {
      onSortChange(value);
    }
  };

  // Render rating distribution
  const renderRatingDistribution = () => (
    <ModernCard sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Rating Overview
        </Typography>

        <Box display="flex" alignItems="center" gap={3} mb={3}>
          {/* Average Rating */}
          <Box textAlign="center">
            <Typography variant="h2" fontWeight={700} color="primary.main">
              {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
            </Typography>
            <Rating
              value={averageRating}
              readOnly
              precision={0.1}
              size="large"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#FFA500',
                },
              }}
            />
            <Typography variant="body2" color="text.secondary" mt={1}>
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Rating Distribution */}
          <Box flexGrow={1}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Box key={rating} display="flex" alignItems="center" gap={2} mb={1}>
                <Box display="flex" alignItems="center" gap={0.5} minWidth={60}>
                  <Typography variant="body2" fontWeight={600}>
                    {rating}
                  </Typography>
                  <Star sx={{ fontSize: 16, color: '#FFA500' }} />
                </Box>
                <Box
                  sx={{
                    flexGrow: 1,
                    height: 8,
                    bgcolor: 'grey.200',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${getRatingPercentage(rating)}%`,
                      height: '100%',
                      bgcolor: '#FFA500',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" minWidth={40}>
                  {getRatingPercentage(rating)}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </ModernCard>
  );

  // Render filters and sorting
  const renderControls = () => (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      gap={2}
      mb={3}
    >
      <Typography variant="h6" fontWeight={700}>
        Patient Reviews ({totalReviews})
      </Typography>

      <Box display="flex" gap={2}>
        {/* Filter by rating */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Rating</InputLabel>
          <Select
            value={filterRating}
            label="Filter by Rating"
            onChange={handleFilterChange}
            startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
          >
            <MenuItem value="all">All Ratings</MenuItem>
            <MenuItem value="5">5 Stars</MenuItem>
            <MenuItem value="4">4 Stars</MenuItem>
            <MenuItem value="3">3 Stars</MenuItem>
            <MenuItem value="2">2 Stars</MenuItem>
            <MenuItem value="1">1 Star</MenuItem>
          </Select>
        </FormControl>

        {/* Sort by */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={handleSortChange}
            startAdornment={<Sort sx={{ mr: 1, color: 'text.secondary' }} />}
          >
            <MenuItem value="recent">Most Recent</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
            <MenuItem value="highest">Highest Rating</MenuItem>
            <MenuItem value="lowest">Lowest Rating</MenuItem>
            <MenuItem value="helpful">Most Helpful</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );

  // Render single review
  const renderReview = (review, index) => {
    const {
      id,
      patientName,
      patientAvatar,
      rating,
      comment,
      createdAt,
      doctorResponse,
      respondedAt,
      isVerifiedPatient,
      helpfulCount = 0,
    } = review;

    return (
      <ModernCard
        key={id || index}
        component={motion.div}
        variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
        sx={{ mb: 2 }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Review Header */}
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                src={patientAvatar}
                alt={patientName}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.main',
                }}
              >
                {patientName?.[0]}
              </Avatar>
              <Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {patientName || 'Anonymous'}
                  </Typography>
                  {isVerifiedPatient && (
                    <Chip
                      icon={<VerifiedUser />}
                      label="Verified Patient"
                      size="small"
                      color="primary"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(createdAt)}
                </Typography>
              </Box>
            </Box>

            <Rating
              value={rating}
              readOnly
              size="small"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#FFA500',
                },
              }}
            />
          </Box>

          {/* Review Comment */}
          {comment && (
            <Typography
              variant="body1"
              color="text.primary"
              sx={{
                mb: 2,
                lineHeight: 1.7,
              }}
            >
              {comment}
            </Typography>
          )}

          {/* Helpful Button */}
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              size="small"
              startIcon={<ThumbUp />}
              sx={{
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Helpful ({helpfulCount})
            </Button>
          </Box>

          {/* Doctor Response */}
          {doctorResponse && (
            <Paper
              elevation={0}
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'primary.50',
                border: '1px solid',
                borderColor: 'primary.100',
                borderRadius: 2,
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Reply sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                  Doctor's Response
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  • {formatDate(respondedAt)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.7 }}>
                {doctorResponse}
              </Typography>
            </Paper>
          )}
        </CardContent>
      </ModernCard>
    );
  };

  // Empty state
  if (!safeReviews || safeReviews.length === 0) {
    return (
      <>
        {totalReviews > 0 && renderRatingDistribution()}
        <ModernCard>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Star sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Reviews Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to leave a review for this doctor.
            </Typography>
          </CardContent>
        </ModernCard>
      </>
    );
  }

  const totalPages = Math.ceil(totalReviews / pageSize);

  return (
    <Box>
      {/* Rating Distribution */}
      {renderRatingDistribution()}

      {/* Controls */}
      {renderControls()}

      {/* Reviews List */}
      <Box
        component={motion.div}
        variants={getAccessibleVariants(staggerContainer, prefersReducedMotion)}
        initial="initial"
        animate="animate"
      >
        {safeReviews.map((review, index) => renderReview(review, index))}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, page) => onPageChange && onPageChange(page)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
});

DoctorReviewsSection.displayName = 'DoctorReviewsSection';

export default DoctorReviewsSection;
