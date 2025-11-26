import api from './api';

/**
 * Analytics Service
 * Handles all analytics and reporting data fetching operations
 */

// Get dashboard analytics with date range
export const getDashboardAnalytics = async (startDate, endDate) => {
  const response = await api.get('/admin/analytics/dashboard', {
    params: { startDate, endDate }
  });
  return response.data;
};

// Get appointment trends over time
export const getAppointmentTrends = async (period = '30d') => {
  const response = await api.get('/admin/analytics/appointments/trends', {
    params: { period }
  });
  return response.data;
};

// Get user growth statistics
export const getUserGrowth = async (period = '12m') => {
  const response = await api.get('/admin/analytics/users/growth', {
    params: { period }
  });
  return response.data;
};

// Get system health metrics
export const getSystemHealth = async () => {
  const response = await api.get('/admin/analytics/system-health');
  return response.data;
};

// Get doctor performance metrics
export const getDoctorPerformance = async () => {
  const response = await api.get('/admin/analytics/doctor-performance');
  return response.data;
};

// Get appointment distribution by status
export const getAppointmentDistribution = async (startDate, endDate) => {
  const response = await api.get('/admin/analytics/appointments/distribution', {
    params: { startDate, endDate }
  });
  return response.data;
};

// Get revenue analytics (if applicable)
export const getRevenueAnalytics = async (startDate, endDate) => {
  const response = await api.get('/admin/analytics/revenue', {
    params: { startDate, endDate }
  });
  return response.data;
};

// Get peak hours analytics
export const getPeakHoursAnalytics = async () => {
  const response = await api.get('/admin/analytics/peak-hours');
  return response.data;
};

// Get specialty distribution
export const getSpecialtyDistribution = async () => {
  const response = await api.get('/admin/analytics/specialty-distribution');
  return response.data;
};

// Get cancellation analytics
export const getCancellationAnalytics = async (startDate, endDate) => {
  const response = await api.get('/admin/analytics/cancellations', {
    params: { startDate, endDate }
  });
  return response.data;
};

export default {
  getDashboardAnalytics,
  getAppointmentTrends,
  getUserGrowth,
  getSystemHealth,
  getDoctorPerformance,
  getAppointmentDistribution,
  getRevenueAnalytics,
  getPeakHoursAnalytics,
  getSpecialtyDistribution,
  getCancellationAnalytics,
};
