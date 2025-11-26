import api from './api';

/**
 * Export Service
 * Handles data export operations in various formats (CSV, Excel, PDF)
 */

// Export users data
export const exportUsers = async (format = 'csv', filters = {}) => {
  const response = await api.post('/admin/export/users', 
    { format, filters },
    { responseType: 'blob' }
  );
  return response.data;
};

// Export doctors data
export const exportDoctors = async (format = 'csv', filters = {}) => {
  const response = await api.post('/admin/export/doctors',
    { format, filters },
    { responseType: 'blob' }
  );
  return response.data;
};

// Export appointments data
export const exportAppointments = async (format = 'csv', filters = {}) => {
  const response = await api.post('/admin/export/appointments',
    { format, filters },
    { responseType: 'blob' }
  );
  return response.data;
};

// Export audit logs
export const exportAuditLogs = async (format = 'csv', filters = {}) => {
  const response = await api.post('/admin/export/audit-logs',
    { format, filters },
    { responseType: 'blob' }
  );
  return response.data;
};

// Export analytics report
export const exportAnalyticsReport = async (format = 'pdf', startDate, endDate) => {
  const response = await api.post('/admin/export/analytics',
    { format, startDate, endDate },
    { responseType: 'blob' }
  );
  return response.data;
};

// Export doctor performance report
export const exportDoctorPerformance = async (format = 'pdf') => {
  const response = await api.post('/admin/export/doctor-performance',
    { format },
    { responseType: 'blob' }
  );
  return response.data;
};

// Export system health report
export const exportSystemHealthReport = async (format = 'pdf') => {
  const response = await api.post('/admin/export/system-health',
    { format },
    { responseType: 'blob' }
  );
  return response.data;
};

/**
 * Helper function to download exported file
 * @param {Blob} blob - The blob data from the export
 * @param {string} filename - The desired filename
 */
export const downloadExportedFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Generate filename with timestamp
 * @param {string} entityType - Type of entity (users, doctors, appointments, etc.)
 * @param {string} format - File format (csv, excel, pdf)
 * @returns {string} Generated filename
 */
export const generateExportFilename = (entityType, format) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const extension = format === 'excel' ? 'xlsx' : format;
  return `${entityType}_export_${timestamp}.${extension}`;
};

/**
 * Export with automatic download
 * @param {Function} exportFunction - The export service function to call
 * @param {string} entityType - Type of entity being exported
 * @param {string} format - Export format
 * @param {Object} params - Additional parameters for the export
 * @param {number} retries - Number of retry attempts (default: 2)
 */
export const exportAndDownload = async (exportFunction, entityType, format, params = {}, retries = 2) => {
  let lastError = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const blob = await exportFunction(format, params);
      
      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error('Export returned empty data');
      }
      
      const filename = generateExportFilename(entityType, format);
      downloadExportedFile(blob, filename);
      return { success: true, filename, attempts: attempt + 1 };
    } catch (error) {
      lastError = error;
      console.error(`Export attempt ${attempt + 1} failed:`, error);
      
      // Don't retry on the last attempt
      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  // All attempts failed
  throw new Error(lastError?.message || 'Export failed after multiple attempts');
};

export default {
  exportUsers,
  exportDoctors,
  exportAppointments,
  exportAuditLogs,
  exportAnalyticsReport,
  exportDoctorPerformance,
  exportSystemHealthReport,
  downloadExportedFile,
  generateExportFilename,
  exportAndDownload,
};
