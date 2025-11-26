import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

// Cache for profile data with TTL
const profileCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook for managing doctor profile data with caching and optimistic updates
 * Fetches and manages doctor profile, credentials, reviews, statistics, and availability
 * 
 * @param {number} doctorId - The ID of the doctor
 * @returns {Object} Profile data and management functions
 */
export const useDoctorProfile = (doctorId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [profileCompleteness, setProfileCompleteness] = useState(null);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Check cache for profile data
  const getCachedProfile = useCallback((key) => {
    const cached = profileCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    profileCache.delete(key);
    return null;
  }, []);

  // Set cache for profile data
  const setCachedProfile = useCallback((key, data) => {
    profileCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  // Fetch doctor profile with caching
  const fetchProfile = useCallback(async (forceRefresh = false) => {
    if (!doctorId) return;

    const cacheKey = `profile_${doctorId}`;
    
    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = getCachedProfile(cacheKey);
      if (cached && isMountedRef.current) {
        setProfile(cached.profile);
        setProfileCompleteness(cached.completeness);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch profile
      const profileResponse = await api.get(`/doctors/profile/${doctorId}`);
      
      if (!isMountedRef.current) return;
      
      const profileData = profileResponse.data;
      setProfile(profileData);

      // Fetch profile completeness
      let completenessData = null;
      try {
        const completenessResponse = await api.get(`/doctors/profile/${doctorId}/completeness`);
        completenessData = completenessResponse.data.percentage;
        if (isMountedRef.current) {
          setProfileCompleteness(completenessData);
        }
      } catch (err) {
        console.warn('Failed to fetch profile completeness:', err);
        if (isMountedRef.current) {
          setProfileCompleteness(null);
        }
      }

      // Cache the results
      setCachedProfile(cacheKey, {
        profile: profileData,
        completeness: completenessData,
      });
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
      if (isMountedRef.current) {
        setError('Failed to load profile');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [doctorId, getCachedProfile, setCachedProfile]);

  // Fetch credentials
  const fetchCredentials = useCallback(async () => {
    if (!doctorId) return;

    try {
      const response = await api.get(`/doctors/${doctorId}/credentials`);
      setCredentials(response.data || []);
    } catch (err) {
      console.error('Error fetching credentials:', err);
      setCredentials([]);
    }
  }, [doctorId]);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    if (!doctorId) return;

    try {
      const response = await api.get(`/doctors/${doctorId}/reviews`);
      setReviews(response.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    }
  }, [doctorId]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    if (!doctorId) return;

    try {
      const response = await api.get(`/doctors/${doctorId}/statistics`);
      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setStatistics(null);
    }
  }, [doctorId]);

  // Fetch availability
  const fetchAvailability = useCallback(async () => {
    if (!doctorId) return;

    try {
      const response = await api.get(`/doctors/${doctorId}/availability`);
      setAvailability(response.data || []);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setAvailability([]);
    }
  }, [doctorId]);

  // Upload avatar with optimistic update
  const uploadAvatar = useCallback(async (file) => {
    if (!doctorId) throw new Error('Doctor ID is required');

    // Create preview URL for optimistic update
    const previewUrl = URL.createObjectURL(file);
    const previousProfile = profile;

    try {
      // Optimistic update
      if (isMountedRef.current) {
        setProfile(prev => prev ? { ...prev, avatarUrl: previewUrl } : prev);
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/doctors/profile/${doctorId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update with actual URL
      if (isMountedRef.current) {
        setProfile(prev => prev ? { ...prev, avatarUrl: response.data.avatarUrl } : prev);
      }

      // Invalidate cache
      profileCache.delete(`profile_${doctorId}`);

      // Cleanup preview URL
      URL.revokeObjectURL(previewUrl);

      return response.data;
    } catch (err) {
      // Rollback on error
      if (isMountedRef.current) {
        setProfile(previousProfile);
      }
      URL.revokeObjectURL(previewUrl);
      throw err;
    }
  }, [doctorId, profile]);

  // Update profile with optimistic update
  const updateProfile = useCallback(async (profileData) => {
    if (!doctorId) throw new Error('Doctor ID is required');

    const previousProfile = profile;
    const previousCompleteness = profileCompleteness;

    try {
      // Optimistic update
      if (isMountedRef.current) {
        setProfile(prev => prev ? { ...prev, ...profileData } : prev);
      }

      const response = await api.put(`/doctors/profile/${doctorId}`, profileData);
      
      if (!isMountedRef.current) return response.data;
      
      setProfile(response.data);

      // Refresh completeness
      try {
        const completenessResponse = await api.get(`/doctors/profile/${doctorId}/completeness`);
        if (isMountedRef.current) {
          setProfileCompleteness(completenessResponse.data.percentage);
        }
      } catch (err) {
        console.warn('Failed to refresh profile completeness:', err);
      }

      // Invalidate cache
      profileCache.delete(`profile_${doctorId}`);

      return response.data;
    } catch (err) {
      // Rollback on error
      if (isMountedRef.current) {
        setProfile(previousProfile);
        setProfileCompleteness(previousCompleteness);
      }
      throw err;
    }
  }, [doctorId, profile, profileCompleteness]);

  // Refresh all data with force refresh option
  const refresh = useCallback(async (forceRefresh = true) => {
    await Promise.all([
      fetchProfile(forceRefresh),
      fetchCredentials(),
      fetchReviews(),
      fetchStatistics(),
      fetchAvailability(),
    ]);
  }, [fetchProfile, fetchCredentials, fetchReviews, fetchStatistics, fetchAvailability]);

  // Clear cache for this doctor
  const clearCache = useCallback(() => {
    profileCache.delete(`profile_${doctorId}`);
  }, [doctorId]);

  // Initial fetch
  useEffect(() => {
    if (doctorId) {
      refresh(false); // Use cache on initial load
    }
  }, [doctorId]); // Only depend on doctorId to avoid infinite loops

  return {
    loading,
    error,
    profile,
    credentials,
    reviews,
    statistics,
    availability,
    profileCompleteness,
    uploadAvatar,
    updateProfile,
    refresh,
    clearCache,
  };
};
