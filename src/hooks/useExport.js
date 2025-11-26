import { useState, useCallback } from 'react';
import {
  exportUsers,
  exportDoctors,
  exportAppointments,
  exportAuditLogs,
  exportAnalyticsReport,
  exportDoctorPerformance,
  exportSystemHealthReport,
  downloadExportedFile,
  generateExportFilename,
} from '../services/exportService';

/**
 * Hook for managing data export operations
 * Provides export functionality with progress tracking and error handling
 * 
 * @returns {Object} Export functions and state
 */
export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const [exportError, setExportError] = useState(null);
  const [lastExport, setLastExport] = useState(null);

  /**
   * Generic export handler with retry logic
   * @param {Function} exportFn - Export service function
   * @param {string} entityType - Type of entity being exported
   * @param {string} format - Export format (csv, excel, pdf)
   * @param {Object} params - Additional parameters
   * @param {number} maxRetries - Maximum number of retry attempts
   * @returns {Object} Export result
   */
  const handleExport = useCallback(async (exportFn, entityType, format, params = {}, maxRetries = 2) => {
    setIsExporting(true);
    setExportError(null);
    setExportProgress({ status: 'preparing', message: 'Preparing export...' });

    let lastError = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Call export function
        const blob = await exportFn(format, params);
        
        // Validate blob
        if (!blob || blob.size === 0) {
          throw new Error('Export returned empty data. Please try again.');
        }
        
        setExportProgress({ status: 'downloading', message: 'Downloading file...' });

        // Generate filename and download
        const filename = generateExportFilename(entityType, format);
        downloadExportedFile(blob, filename);

        // Update last export info
        const exportInfo = {
          entityType,
          format,
          filename,
          timestamp: new Date(),
          success: true,
          attempts: attempt + 1,
        };
        setLastExport(exportInfo);
        
        setExportProgress({ status: 'complete', message: 'Export complete!' });

        // Clear progress after a delay
        setTimeout(() => {
          setExportProgress(null);
        }, 2000);

        return { success: true, filename, attempts: attempt + 1 };
      } catch (error) {
        lastError = error;
        console.error(`Export attempt ${attempt + 1} failed:`, error);
        
        // Don't retry on the last attempt
        if (attempt < maxRetries) {
          setExportProgress({ 
            status: 'retrying', 
            message: `Retrying export (${attempt + 1}/${maxRetries})...` 
          });
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    // All attempts failed
    const errorMessage = lastError?.message || 'Export failed after multiple attempts. Please try again later.';
    setExportError(errorMessage);
    setExportProgress({ status: 'error', message: errorMessage });

    // Clear error after a delay
    setTimeout(() => {
      setExportProgress(null);
      setExportError(null);
    }, 5000);

    setIsExporting(false);
    return { success: false, error: errorMessage, attempts: maxRetries + 1 };
  }, []);

  // Export users
  const exportUsersData = useCallback(async (format = 'csv', filters = {}) => {
    return handleExport(exportUsers, 'users', format, filters);
  }, [handleExport]);

  // Export doctors
  const exportDoctorsData = useCallback(async (format = 'csv', filters = {}) => {
    return handleExport(exportDoctors, 'doctors', format, filters);
  }, [handleExport]);

  // Export appointments
  const exportAppointmentsData = useCallback(async (format = 'csv', filters = {}) => {
    return handleExport(exportAppointments, 'appointments', format, filters);
  }, [handleExport]);

  // Export audit logs
  const exportAuditLogsData = useCallback(async (format = 'csv', filters = {}) => {
    return handleExport(exportAuditLogs, 'audit-logs', format, filters);
  }, [handleExport]);

  // Export analytics report
  const exportAnalyticsData = useCallback(async (format = 'pdf', startDate = null, endDate = null) => {
    return handleExport(
      (fmt) => exportAnalyticsReport(fmt, startDate, endDate),
      'analytics-report',
      format
    );
  }, [handleExport]);

  // Export doctor performance report
  const exportDoctorPerformanceData = useCallback(async (format = 'pdf') => {
    return handleExport(
      (fmt) => exportDoctorPerformance(fmt),
      'doctor-performance',
      format
    );
  }, [handleExport]);

  // Export system health report
  const exportSystemHealthData = useCallback(async (format = 'pdf') => {
    return handleExport(
      (fmt) => exportSystemHealthReport(fmt),
      'system-health',
      format
    );
  }, [handleExport]);

  /**
   * Export with custom options
   * @param {string} entityType - Type of entity to export
   * @param {string} format - Export format
   * @param {Object} options - Export options including filters
   * @returns {Object} Export result
   */
  const exportWithOptions = useCallback(async (entityType, format, options = {}) => {
    const exportFunctions = {
      users: exportUsers,
      doctors: exportDoctors,
      appointments: exportAppointments,
      'audit-logs': exportAuditLogs,
      analytics: exportAnalyticsReport,
      'doctor-performance': exportDoctorPerformance,
      'system-health': exportSystemHealthReport,
    };

    const exportFn = exportFunctions[entityType];
    if (!exportFn) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    return handleExport(exportFn, entityType, format, options);
  }, [handleExport]);

  // Clear export error
  const clearError = useCallback(() => {
    setExportError(null);
    setExportProgress(null);
  }, []);

  // Reset export state
  const reset = useCallback(() => {
    setIsExporting(false);
    setExportProgress(null);
    setExportError(null);
    setLastExport(null);
  }, []);

  return {
    // State
    isExporting,
    exportProgress,
    exportError,
    lastExport,

    // Export functions
    exportUsersData,
    exportDoctorsData,
    exportAppointmentsData,
    exportAuditLogsData,
    exportAnalyticsData,
    exportDoctorPerformanceData,
    exportSystemHealthData,
    exportWithOptions,

    // Utility functions
    clearError,
    reset,
  };
};

export default useExport;
