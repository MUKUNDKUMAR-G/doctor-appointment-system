import { describe, it, expect, vi, beforeEach } from 'vitest';
import adminService from '../adminService';
import analyticsService from '../analyticsService';
import auditService from '../auditService';
import exportService from '../exportService';
import api from '../api';

// Mock the api module
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('Admin Service Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('adminService', () => {
    it('should have bulk user operation methods', () => {
      expect(adminService.bulkEnableUsers).toBeDefined();
      expect(adminService.bulkDisableUsers).toBeDefined();
      expect(adminService.bulkDeleteUsers).toBeDefined();
      expect(adminService.bulkChangeUserRoles).toBeDefined();
    });

    it('should have bulk doctor operation methods', () => {
      expect(adminService.bulkEnableDoctors).toBeDefined();
      expect(adminService.bulkDisableDoctors).toBeDefined();
      expect(adminService.bulkVerifyDoctors).toBeDefined();
    });

    it('should call correct endpoint for bulk enable users', async () => {
      const mockResponse = { data: { successCount: 2, failureCount: 0 } };
      api.post.mockResolvedValue(mockResponse);

      const userIds = [1, 2];
      await adminService.bulkEnableUsers(userIds);

      expect(api.post).toHaveBeenCalledWith('/api/admin/users/bulk/enable', { userIds });
    });
  });

  describe('analyticsService', () => {
    it('should have all analytics methods', () => {
      expect(analyticsService.getDashboardAnalytics).toBeDefined();
      expect(analyticsService.getAppointmentTrends).toBeDefined();
      expect(analyticsService.getUserGrowth).toBeDefined();
      expect(analyticsService.getSystemHealth).toBeDefined();
      expect(analyticsService.getDoctorPerformance).toBeDefined();
    });

    it('should call correct endpoint for dashboard analytics', async () => {
      const mockResponse = { data: { userGrowth: [], appointmentTrends: [] } };
      api.get.mockResolvedValue(mockResponse);

      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      await analyticsService.getDashboardAnalytics(startDate, endDate);

      expect(api.get).toHaveBeenCalledWith('/api/admin/analytics/dashboard', {
        params: { startDate, endDate }
      });
    });

    it('should call correct endpoint for appointment trends with default period', async () => {
      const mockResponse = { data: [] };
      api.get.mockResolvedValue(mockResponse);

      await analyticsService.getAppointmentTrends();

      expect(api.get).toHaveBeenCalledWith('/api/admin/analytics/appointments/trends', {
        params: { period: '30d' }
      });
    });
  });

  describe('auditService', () => {
    it('should have all audit log methods', () => {
      expect(auditService.getAuditLogs).toBeDefined();
      expect(auditService.getAuditLogsByDateRange).toBeDefined();
      expect(auditService.getAuditLogsByAction).toBeDefined();
      expect(auditService.getAuditLogsByAdmin).toBeDefined();
      expect(auditService.searchAuditLogs).toBeDefined();
    });

    it('should call correct endpoint for audit logs with filters', async () => {
      const mockResponse = { data: { content: [], totalElements: 0 } };
      api.get.mockResolvedValue(mockResponse);

      const filters = { severity: 'CRITICAL' };
      await auditService.getAuditLogs(filters, 0, 20);

      expect(api.get).toHaveBeenCalledWith('/api/admin/audit-logs', {
        params: {
          severity: 'CRITICAL',
          page: 0,
          size: 20,
        }
      });
    });
  });

  describe('exportService', () => {
    it('should have all export methods', () => {
      expect(exportService.exportUsers).toBeDefined();
      expect(exportService.exportDoctors).toBeDefined();
      expect(exportService.exportAppointments).toBeDefined();
      expect(exportService.exportAuditLogs).toBeDefined();
      expect(exportService.exportAnalyticsReport).toBeDefined();
    });

    it('should have helper methods', () => {
      expect(exportService.downloadExportedFile).toBeDefined();
      expect(exportService.generateExportFilename).toBeDefined();
      expect(exportService.exportAndDownload).toBeDefined();
    });

    it('should call correct endpoint for user export', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      const mockResponse = { data: mockBlob };
      api.post.mockResolvedValue(mockResponse);

      const format = 'csv';
      const filters = { role: 'PATIENT' };
      await exportService.exportUsers(format, filters);

      expect(api.post).toHaveBeenCalledWith(
        '/api/admin/export/users',
        { format, filters },
        { responseType: 'blob' }
      );
    });

    it('should generate correct filename format', () => {
      const filename = exportService.generateExportFilename('users', 'csv');
      expect(filename).toMatch(/^users_export_\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should generate correct filename for excel format', () => {
      const filename = exportService.generateExportFilename('doctors', 'excel');
      expect(filename).toMatch(/^doctors_export_\d{4}-\d{2}-\d{2}\.xlsx$/);
    });
  });
});
