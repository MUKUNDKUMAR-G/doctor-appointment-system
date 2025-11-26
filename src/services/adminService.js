import api from './api';

// Get system statistics
export const getSystemStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// User Management
export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const updateUserStatus = async (userId, enabled) => {
  const response = await api.put(`/admin/users/${userId}/status`, { enabled });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

// Doctor Management
export const getAllDoctorsAdmin = async () => {
  const response = await api.get('/admin/doctors');
  return response.data;
};

export const updateDoctorAvailability = async (doctorId, isAvailable) => {
  const response = await api.put(`/admin/doctors/${doctorId}/availability`, { isAvailable });
  return response.data;
};

// Appointment Management
export const getAllAppointmentsAdmin = async () => {
  const response = await api.get('/admin/appointments');
  return response.data;
};

export const getAppointmentsByDate = async (date) => {
  const response = await api.get(`/admin/appointments/date/${date}`);
  return response.data;
};

// Recent Activity
export const getRecentActivity = async (limit = 10) => {
  const response = await api.get(`/admin/activity?limit=${limit}`);
  return response.data;
};

// Reports
export const getAppointmentReport = async (startDate, endDate) => {
  const response = await api.get('/admin/reports/appointments', {
    params: { startDate, endDate }
  });
  return response.data;
};

export const getDoctorPerformanceReport = async () => {
  const response = await api.get('/admin/reports/doctor-performance');
  return response.data;
};

// Credential Verification
export const getPendingCredentials = async () => {
  const response = await api.get('/admin/credentials/pending');
  return response.data;
};

export const verifyCredential = async (credentialId, status, notes) => {
  const response = await api.put(`/admin/credentials/${credentialId}/verify`, {
    status,
    notes,
  });
  return response.data;
};

// Doctor Verification
export const verifyDoctor = async (doctorId, isVerified) => {
  const response = await api.put(`/admin/doctors/${doctorId}/verify`, { isVerified });
  return response.data;
};

export const bulkEnableDoctors = async (doctorIds) => {
  const response = await api.post('/admin/doctors/bulk/enable', { doctorIds });
  return response.data;
};

export const bulkDisableDoctors = async (doctorIds) => {
  const response = await api.post('/admin/doctors/bulk/disable', { doctorIds });
  return response.data;
};

export const bulkVerifyDoctors = async (doctorIds) => {
  const response = await api.post('/admin/doctors/bulk/verify', { doctorIds });
  return response.data;
};

// Review Moderation
export const getFlaggedReviews = async () => {
  const response = await api.get('/admin/reviews/flagged');
  return response.data;
};

export const moderateReview = async (reviewId, action, notes) => {
  const response = await api.put(`/admin/reviews/${reviewId}/moderate`, {
    action,
    notes,
  });
  return response.data;
};

export const removeReview = async (reviewId, reason) => {
  const response = await api.delete(`/admin/reviews/${reviewId}`, {
    data: { reason },
  });
  return response.data;
};

export const dismissReviewFlag = async (reviewId, notes) => {
  const response = await api.put(`/admin/reviews/${reviewId}/dismiss-flag`, { notes });
  return response.data;
};

// Bulk User Operations
export const bulkEnableUsers = async (userIds) => {
  const response = await api.post('/admin/users/bulk/enable', { userIds });
  return response.data;
};

export const bulkDisableUsers = async (userIds) => {
  const response = await api.post('/admin/users/bulk/disable', { userIds });
  return response.data;
};

export const bulkDeleteUsers = async (userIds) => {
  const response = await api.post('/admin/users/bulk/delete', { userIds });
  return response.data;
};

export const bulkChangeUserRoles = async (userIds, role) => {
  const response = await api.post('/admin/users/bulk/change-role', { userIds, role });
  return response.data;
};

export default {
  getSystemStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllDoctorsAdmin,
  updateDoctorAvailability,
  getAllAppointmentsAdmin,
  getAppointmentsByDate,
  getRecentActivity,
  getAppointmentReport,
  getDoctorPerformanceReport,
  getPendingCredentials,
  verifyCredential,
  verifyDoctor,
  bulkEnableDoctors,
  bulkDisableDoctors,
  bulkVerifyDoctors,
  getFlaggedReviews,
  moderateReview,
  removeReview,
  dismissReviewFlag,
  bulkEnableUsers,
  bulkDisableUsers,
  bulkDeleteUsers,
  bulkChangeUserRoles,
};
