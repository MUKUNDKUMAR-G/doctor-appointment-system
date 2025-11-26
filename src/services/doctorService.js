import api from './api';
import { endpoints } from '../utils/config';

export const doctorService = {
  // Get all doctors with caching and filtering
  getAllDoctors: async (specialty = null, cancelToken) => {
    const params = specialty ? { specialty } : {};
    const response = await api.get(endpoints.doctors.list, { 
      params,
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Search doctors with debouncing support
  searchDoctors: async (searchParams, cancelToken) => {
    const response = await api.get(endpoints.doctors.search, { 
      params: searchParams,
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Get doctor by ID
  getDoctorById: async (doctorId, cancelToken) => {
    const response = await api.get(`/doctors/${doctorId}`, {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Get doctor profile with caching
  getDoctorProfile: async (doctorId, cancelToken) => {
    const response = await api.get(endpoints.doctors.profile(doctorId), {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Get doctor availability with real-time updates
  getDoctorAvailability: async (doctorId, date, cancelToken) => {
    const params = { 
      date: typeof date === 'string' ? date : date.toISOString().split('T')[0] 
    };
    const response = await api.get(endpoints.doctors.availability(doctorId), { 
      params,
      cancelToken,
      skipLoading: true, // Don't show global loading for availability checks
    });
    return response.data;
  },

  // Get doctor availability for multiple days
  getDoctorAvailabilityRange: async (doctorId, startDate, endDate, cancelToken) => {
    const params = {
      startDate: typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0],
      endDate: typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0],
    };
    const response = await api.get(`${endpoints.doctors.availability(doctorId)}/range`, {
      params,
      cancelToken,
      skipLoading: true,
    });
    return response.data;
  },

  // Get doctor specialties for filtering
  getDoctorSpecialties: async (cancelToken) => {
    const response = await api.get('/doctors/specialties', {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Get doctor reviews and ratings
  getDoctorReviews: async (doctorId, page = 1, limit = 10, cancelToken) => {
    const response = await api.get(`${endpoints.doctors.profile(doctorId)}/reviews`, {
      params: { page, limit },
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Check if doctor is available at specific time
  checkDoctorAvailability: async (doctorId, dateTime, cancelToken) => {
    const response = await api.get(
      `${endpoints.doctors.availability(doctorId)}/check`,
      {
        params: { dateTime },
        cancelToken,
        skipLoading: true,
      }
    );
    return response.data;
  },

  // Submit a review for a doctor
  submitReview: async (reviewData, cancelToken) => {
    const response = await api.post('/reviews', reviewData, {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Mark a review as helpful
  markReviewHelpful: async (reviewId, cancelToken) => {
    const response = await api.post(`/reviews/${reviewId}/helpful`, {}, {
      cancelToken,
      skipLoading: true,
    });
    return response.data;
  },

  // Report a review
  reportReview: async (reviewId, reason, cancelToken) => {
    const response = await api.post(`/reviews/${reviewId}/report`, { reason }, {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // ============================================
  // Doctor Profile Management APIs
  // ============================================

  // Get complete doctor profile with all details
  getCompleteProfile: async (doctorId, cancelToken) => {
    const response = await api.get(`/doctors/profile/${doctorId}`, {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Update doctor profile
  updateDoctorProfile: async (doctorId, profileData, cancelToken) => {
    const response = await api.put(`/doctors/profile/${doctorId}`, profileData, {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Upload doctor avatar
  uploadAvatar: async (doctorId, file, cancelToken) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/doctors/profile/${doctorId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Get profile completeness
  getProfileCompleteness: async (doctorId, cancelToken) => {
    const response = await api.get(`/doctors/profile/${doctorId}/completeness`, {
      cancelToken,
      skipLoading: true,
    });
    return response.data;
  },

  // ============================================
  // Doctor Credentials APIs
  // ============================================

  // Get doctor credentials
  getDoctorCredentials: async (doctorId, cancelToken) => {
    const response = await api.get(`/doctors/${doctorId}/credentials`, {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Upload credential document
  uploadCredential: async (doctorId, credentialData, cancelToken) => {
    const response = await api.post(`/doctors/${doctorId}/credentials`, credentialData, {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Update credential
  updateCredential: async (doctorId, credentialId, credentialData, cancelToken) => {
    const response = await api.put(
      `/doctors/${doctorId}/credentials/${credentialId}`,
      credentialData,
      {
        cancelToken,
        skipErrorHandling: false,
      }
    );
    return response.data;
  },

  // Delete credential
  deleteCredential: async (doctorId, credentialId, cancelToken) => {
    const response = await api.delete(`/doctors/${doctorId}/credentials/${credentialId}`, {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // ============================================
  // Doctor Statistics APIs
  // ============================================

  // Get doctor statistics
  getDoctorStatistics: async (doctorId, params = {}, cancelToken) => {
    const response = await api.get(`/doctors/${doctorId}/statistics`, {
      params,
      cancelToken,
      skipLoading: true,
    });
    return response.data;
  },

  // Get doctor analytics
  getDoctorAnalytics: async (doctorId, params = {}, cancelToken) => {
    const response = await api.get(`/doctors/profile/${doctorId}/analytics`, {
      params,
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // ============================================
  // Doctor Reviews APIs (Enhanced)
  // ============================================

  // Get paginated reviews
  getDoctorReviewsPaginated: async (doctorId, page = 1, limit = 10, cancelToken) => {
    const response = await api.get(`/doctors/${doctorId}/reviews`, {
      params: { page, limit },
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Submit review for doctor
  submitDoctorReview: async (doctorId, reviewData, cancelToken) => {
    const response = await api.post(`/doctors/${doctorId}/reviews`, reviewData, {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Doctor responds to review
  respondToReview: async (doctorId, reviewId, responseText, cancelToken) => {
    const response = await api.post(
      `/doctors/${doctorId}/reviews/${reviewId}/respond`,
      { response: responseText },
      {
        cancelToken,
        skipErrorHandling: false,
      }
    );
    return response.data;
  },

  // ============================================
  // Doctor Availability APIs (Enhanced)
  // ============================================

  // Get availability for date range
  getAvailabilityRange: async (doctorId, startDate, endDate, cancelToken) => {
    const response = await api.get(`/doctors/${doctorId}/availability/range`, {
      params: {
        startDate: typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0],
        endDate: typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0],
      },
      cancelToken,
      skipLoading: true,
    });
    return response.data;
  },

  // Get available time slots for a date
  getAvailableTimeSlots: async (doctorId, date, cancelToken) => {
    const response = await api.get(`/doctors/${doctorId}/availability/slots`, {
      params: {
        date: typeof date === 'string' ? date : date.toISOString().split('T')[0],
      },
      cancelToken,
      skipLoading: true,
    });
    return response.data;
  },

  // Update availability slot
  updateAvailabilitySlot: async (doctorId, slotId, slotData, cancelToken) => {
    const response = await api.put(
      `/doctors/${doctorId}/availability/${slotId}`,
      slotData,
      {
        cancelToken,
        skipErrorHandling: false,
      }
    );
    return response.data;
  },

  // Create availability slot
  createAvailabilitySlot: async (doctorId, slotData, cancelToken) => {
    const response = await api.post(`/doctors/${doctorId}/availability`, slotData, {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Delete availability slot
  deleteAvailabilitySlot: async (doctorId, slotId, cancelToken) => {
    const response = await api.delete(`/doctors/${doctorId}/availability/${slotId}`, {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Bulk update availability
  bulkUpdateAvailability: async (doctorId, bulkData, cancelToken) => {
    const response = await api.post(`/doctors/${doctorId}/availability/bulk`, bulkData, {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Get schedule templates
  getScheduleTemplates: async (doctorId, cancelToken) => {
    const response = await api.get(`/doctors/${doctorId}/availability/templates`, {
      cancelToken,
      skipLoading: true,
    });
    return response.data;
  },

  // Apply schedule template
  applyScheduleTemplate: async (doctorId, templateData, cancelToken) => {
    const response = await api.post(
      `/doctors/${doctorId}/availability/apply-template`,
      templateData,
      {
        cancelToken,
        skipErrorHandling: false,
      }
    );
    return response.data;
  },

  // Check availability conflicts
  checkAvailabilityConflicts: async (doctorId, startDate, endDate, cancelToken) => {
    const response = await api.get(`/doctors/${doctorId}/availability/conflicts`, {
      params: {
        startDate: typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0],
        endDate: typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0],
      },
      cancelToken,
      skipLoading: true,
    });
    return response.data;
  },

  // ============================================
  // Doctor Consultation Fees APIs
  // ============================================

  // Update consultation fees
  updateConsultationFees: async (doctorId, feesData, cancelToken) => {
    const response = await api.put(`/doctors/profile/${doctorId}/fees`, feesData, {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // ============================================
  // Doctor Appointment Requests APIs
  // ============================================

  // Get appointment requests for doctor
  getAppointmentRequests: async (doctorId, status = 'pending', cancelToken) => {
    const response = await api.get(`/doctors/profile/${doctorId}/requests`, {
      params: { status },
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },
};

export default doctorService;