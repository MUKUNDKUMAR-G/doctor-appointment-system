import api from './api';

/**
 * Audit Service
 * Handles audit log operations and filtering
 */

// Get audit logs with filtering and pagination
export const getAuditLogs = async (filters = {}, page = 0, size = 20) => {
  const response = await api.get('/admin/audit-logs', {
    params: {
      ...filters,
      page,
      size,
    }
  });
  return response.data;
};

// Get audit logs by date range
export const getAuditLogsByDateRange = async (startDate, endDate, page = 0, size = 20) => {
  const response = await api.get('/admin/audit-logs', {
    params: {
      startDate,
      endDate,
      page,
      size,
    }
  });
  return response.data;
};

// Get audit logs by action type
export const getAuditLogsByAction = async (action, page = 0, size = 20) => {
  const response = await api.get('/admin/audit-logs', {
    params: {
      action,
      page,
      size,
    }
  });
  return response.data;
};

// Get audit logs by administrator
export const getAuditLogsByAdmin = async (adminId, page = 0, size = 20) => {
  const response = await api.get('/admin/audit-logs', {
    params: {
      adminId,
      page,
      size,
    }
  });
  return response.data;
};

// Get audit logs by severity
export const getAuditLogsBySeverity = async (severity, page = 0, size = 20) => {
  const response = await api.get('/admin/audit-logs', {
    params: {
      severity,
      page,
      size,
    }
  });
  return response.data;
};

// Get audit logs by entity type
export const getAuditLogsByEntityType = async (entityType, page = 0, size = 20) => {
  const response = await api.get('/admin/audit-logs', {
    params: {
      entityType,
      page,
      size,
    }
  });
  return response.data;
};

// Search audit logs
export const searchAuditLogs = async (searchTerm, page = 0, size = 20) => {
  const response = await api.get('/admin/audit-logs/search', {
    params: {
      q: searchTerm,
      page,
      size,
    }
  });
  return response.data;
};

// Get audit log details by ID
export const getAuditLogById = async (logId) => {
  const response = await api.get(`/admin/audit-logs/${logId}`);
  return response.data;
};

// Get audit log statistics
export const getAuditLogStats = async (startDate, endDate) => {
  const response = await api.get('/admin/audit-logs/stats', {
    params: { startDate, endDate }
  });
  return response.data;
};

// Get recent critical actions
export const getRecentCriticalActions = async (limit = 10) => {
  const response = await api.get('/admin/audit-logs/critical', {
    params: { limit }
  });
  return response.data;
};

export default {
  getAuditLogs,
  getAuditLogsByDateRange,
  getAuditLogsByAction,
  getAuditLogsByAdmin,
  getAuditLogsBySeverity,
  getAuditLogsByEntityType,
  searchAuditLogs,
  getAuditLogById,
  getAuditLogStats,
  getRecentCriticalActions,
};
