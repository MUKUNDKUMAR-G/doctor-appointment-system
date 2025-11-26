import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * Hook for managing doctor reviews with pagination and optimistic updates
 * Fetches and manages review submission, retrieval, and doctor responses
 * 
 * @param {number} doctorId - The ID of the doctor
 * @param {Object} options - Configuration options { pageSize, autoLoad }
 * @returns {Object} Reviews data and management functions
 */
export const useDoctorReviews = (doctorId, options = {}) => {
  const { pageSize = 10, autoLoad = true } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  
  // Track if component is mounted
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch reviews with pagination
  const fetchReviews = useCallback(async (page = 1, append = false) => {
    if (!doctorId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/doctors/${doctorId}/reviews`, {
        params: {
          page,
          limit: pageSize,
        },
      });

      if (!isMountedRef.current) return;

      const data = response.data;
      
      // Handle different response formats
      const reviewsData = data.reviews || data.content || data;
      const total = data.totalElements || data.total || reviewsData.length;
      const pages = data.totalPages || Math.ceil(total / pageSize);
      const avgRating = data.averageRating || 0;

      if (append) {
        setReviews(prev => [...prev, ...reviewsData]);
      } else {
        setReviews(reviewsData);
      }

      setCurrentPage(page);
      setTotalPages(pages);
      setTotalReviews(total);
      setHasMore(page < pages);
      setAverageRating(avgRating);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      if (isMountedRef.current) {
        setError('Failed to load reviews');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [doctorId, pageSize]);

  // Load next page of reviews
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchReviews(currentPage + 1, true);
  }, [hasMore, loading, currentPage, fetchReviews]);

  // Submit a new review with optimistic update
  const submitReview = useCallback(async (reviewData) => {
    if (!doctorId) throw new Error('Doctor ID is required');

    const tempId = `temp_${Date.now()}`;
    const optimisticReview = {
      id: tempId,
      doctorId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      patientName: 'You',
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      ...reviewData,
    };

    try {
      // Optimistic update - add review to the beginning
      if (isMountedRef.current) {
        setReviews(prev => [optimisticReview, ...prev]);
        setTotalReviews(prev => prev + 1);
        
        // Update average rating optimistically
        const newTotal = totalReviews + 1;
        const newAverage = ((averageRating * totalReviews) + reviewData.rating) / newTotal;
        setAverageRating(newAverage);
      }

      // Submit to server
      const response = await api.post(`/doctors/${doctorId}/reviews`, reviewData);

      if (!isMountedRef.current) return response.data;

      // Replace optimistic review with actual data
      setReviews(prev => 
        prev.map(review => 
          review.id === tempId ? response.data : review
        )
      );

      return response.data;
    } catch (err) {
      // Rollback on error
      if (isMountedRef.current) {
        setReviews(prev => prev.filter(review => review.id !== tempId));
        setTotalReviews(prev => Math.max(0, prev - 1));
        
        // Recalculate average rating
        if (totalReviews > 1) {
          const newTotal = totalReviews - 1;
          const newAverage = ((averageRating * totalReviews) - reviewData.rating) / newTotal;
          setAverageRating(newAverage);
        } else {
          setAverageRating(0);
        }
      }
      throw err;
    }
  }, [doctorId, totalReviews, averageRating]);

  // Submit doctor response to a review with optimistic update
  const respondToReview = useCallback(async (reviewId, responseText) => {
    if (!doctorId) throw new Error('Doctor ID is required');

    const previousReviews = reviews;

    try {
      // Optimistic update
      if (isMountedRef.current) {
        setReviews(prev =>
          prev.map(review =>
            review.id === reviewId
              ? {
                  ...review,
                  doctorResponse: responseText,
                  respondedAt: new Date().toISOString(),
                  isOptimisticResponse: true,
                }
              : review
          )
        );
      }

      // Submit to server
      const response = await api.post(
        `/doctors/${doctorId}/reviews/${reviewId}/respond`,
        { response: responseText }
      );

      if (!isMountedRef.current) return response.data;

      // Update with actual data
      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId
            ? { ...review, ...response.data, isOptimisticResponse: false }
            : review
        )
      );

      return response.data;
    } catch (err) {
      // Rollback on error
      if (isMountedRef.current) {
        setReviews(previousReviews);
      }
      throw err;
    }
  }, [doctorId, reviews]);

  // Mark review as helpful
  const markHelpful = useCallback(async (reviewId) => {
    const previousReviews = reviews;

    try {
      // Optimistic update
      if (isMountedRef.current) {
        setReviews(prev =>
          prev.map(review =>
            review.id === reviewId
              ? {
                  ...review,
                  helpfulCount: (review.helpfulCount || 0) + 1,
                  isMarkedHelpful: true,
                }
              : review
          )
        );
      }

      // Submit to server
      await api.post(`/reviews/${reviewId}/helpful`);
    } catch (err) {
      // Rollback on error
      if (isMountedRef.current) {
        setReviews(previousReviews);
      }
      throw err;
    }
  }, [reviews]);

  // Report a review
  const reportReview = useCallback(async (reviewId, reason) => {
    try {
      await api.post(`/reviews/${reviewId}/report`, { reason });
      
      // Optionally mark as reported in UI
      if (isMountedRef.current) {
        setReviews(prev =>
          prev.map(review =>
            review.id === reviewId
              ? { ...review, isReported: true }
              : review
          )
        );
      }
    } catch (err) {
      throw err;
    }
  }, []);

  // Refresh reviews
  const refresh = useCallback(async () => {
    await fetchReviews(1, false);
  }, [fetchReviews]);

  // Reset to first page
  const reset = useCallback(() => {
    setReviews([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalReviews(0);
    setHasMore(false);
    setAverageRating(0);
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (doctorId && autoLoad) {
      fetchReviews(1, false);
    }
  }, [doctorId, autoLoad]); // Only depend on doctorId and autoLoad

  return {
    loading,
    error,
    reviews,
    currentPage,
    totalPages,
    totalReviews,
    hasMore,
    averageRating,
    fetchReviews,
    loadMore,
    submitReview,
    respondToReview,
    markHelpful,
    reportReview,
    refresh,
    reset,
  };
};

export default useDoctorReviews;
