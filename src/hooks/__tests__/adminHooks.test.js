import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { useAdminStats } from '../useAdminStats';
import { useBulkActions } from '../useBulkActions';
import { useAuditLog } from '../useAuditLog';
import { useAnalytics } from '../useAnalytics';
import { useExport } from '../useExport';
import * as adminService from '../../services/adminService';
import * as auditService from '../../services/auditService';
import * as analyticsService from '../../services/analyticsService';
import * as exportService from '../../services/exportService';
import { AdminRealTimeProvider } from '../../contexts/AdminRealTimeContext';

// Mock the services
vi.mock('../../services/adminService');
vi.mock('../../services/auditService');
vi.mock('../../services/analyticsService');
vi.mock('../../services/exportService');

// Mock WebSocket
vi.mock('../../services/websocketService', () => ({
  connectWebSocket: vi.fn(),
  disconnectWebSocket: vi.fn(),
  subscribeToTopic: vi.fn(() => () => {}),
}));

// Mock AdminRealTimeContext
vi.mock('../../contexts/AdminRealTimeContext', () => ({
  useAdminRealTime: () => ({
    stats: null,
    connectionStatus: 'disconnected',
    isConnected: false,
  }),
  AdminRealTimeProvider: ({ children }) => children,
}));

describe('Admin Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('useAdminStats', () => {
    it('should fetch stats on mount', async () => {
      const mockStats = {
        totalUsers: 100,
        totalDoctors: 50,
        todayAppointments: 20,
      };

      adminService.getSystemStats.mockResolvedValue(mockStats);
      adminService.getRecentActivity.mockResolvedValue({ content: [] });

      const { result } = renderHook(() => useAdminStats(0)); // No auto-refresh

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.stats).toEqual(mockStats);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      adminService.getSystemStats.mockRejectedValue(new Error('Failed to fetch'));
      adminService.getRecentActivity.mockRejectedValue(new Error('Failed to fetch'));

      const { result } = renderHook(() => useAdminStats(0));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.error).toBeTruthy();
      expect(result.current.stats).toBeNull();
    });

    it('should refresh stats manually', async () => {
      const mockStats = { totalUsers: 100 };
      adminService.getSystemStats.mockResolvedValue(mockStats);
      adminService.getRecentActivity.mockResolvedValue({ content: [] });

      const { result } = renderHook(() => useAdminStats(0));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      const updatedStats = { totalUsers: 150 };
      adminService.getSystemStats.mockResolvedValue(updatedStats);

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.stats).toEqual(updatedStats);
    });
  });

  describe('useBulkActions', () => {
    it('should select and deselect items', () => {
      const { result } = renderHook(() => useBulkActions());

      expect(result.current.selectedItems).toEqual([]);

      act(() => {
        result.current.selectItem(1);
        result.current.selectItem(2);
      });

      expect(result.current.selectedItems).toEqual([1, 2]);
      expect(result.current.selectedCount).toBe(2);

      act(() => {
        result.current.deselectItem(1);
      });

      expect(result.current.selectedItems).toEqual([2]);
    });

    it('should toggle item selection', () => {
      const { result } = renderHook(() => useBulkActions());

      act(() => {
        result.current.toggleItem(1);
      });

      expect(result.current.selectedItems).toEqual([1]);

      act(() => {
        result.current.toggleItem(1);
      });

      expect(result.current.selectedItems).toEqual([]);
    });

    it('should select all items', () => {
      const { result } = renderHook(() => useBulkActions());

      act(() => {
        result.current.selectAll([1, 2, 3, 4, 5]);
      });

      expect(result.current.selectedItems).toEqual([1, 2, 3, 4, 5]);
      expect(result.current.selectedCount).toBe(5);
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useBulkActions());

      act(() => {
        result.current.selectAll([1, 2, 3]);
      });

      expect(result.current.selectedCount).toBe(3);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedItems).toEqual([]);
    });

    it('should execute bulk action', async () => {
      const { result } = renderHook(() => useBulkActions());
      const mockAction = vi.fn().mockResolvedValue({
        successCount: 2,
        failureCount: 0,
        errors: [],
      });

      act(() => {
        result.current.selectAll([1, 2]);
      });

      let actionResult;
      await act(async () => {
        actionResult = await result.current.executeBulkAction(mockAction);
      });

      expect(mockAction).toHaveBeenCalledWith([1, 2]);
      expect(actionResult.successCount).toBe(2);
      expect(result.current.selectedItems).toEqual([]); // Cleared after success
    });

    it('should check if items are selected', () => {
      const { result } = renderHook(() => useBulkActions());

      act(() => {
        result.current.selectAll([1, 2, 3]);
      });

      expect(result.current.isSelected(1)).toBe(true);
      expect(result.current.isSelected(4)).toBe(false);
      expect(result.current.areAllSelected([1, 2, 3])).toBe(true);
      expect(result.current.areAllSelected([1, 2, 3, 4])).toBe(false);
      expect(result.current.areSomeSelected([1, 2, 3, 4])).toBe(true);
    });
  });

  describe('useAuditLog', () => {
    it('should fetch audit logs on mount', async () => {
      const mockLogs = {
        content: [
          { id: 1, action: 'USER_CREATED', timestamp: '2024-01-01' },
          { id: 2, action: 'USER_DELETED', timestamp: '2024-01-02' },
        ],
        number: 0,
        size: 20,
        totalElements: 2,
        totalPages: 1,
      };

      auditService.getAuditLogs.mockResolvedValue(mockLogs);

      const { result } = renderHook(() => useAuditLog());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.logs).toEqual(mockLogs.content);
      expect(result.current.pagination.totalElements).toBe(2);
    });

    it('should update filters', async () => {
      auditService.getAuditLogs.mockResolvedValue({ content: [], totalElements: 0 });

      const { result } = renderHook(() => useAuditLog());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.updateFilter('action', 'USER_CREATED');
      });

      expect(result.current.filters.action).toBe('USER_CREATED');
      expect(result.current.pagination.page).toBe(0); // Reset to first page
    });

    it('should clear filters', async () => {
      auditService.getAuditLogs.mockResolvedValue({ content: [], totalElements: 0 });

      const initialFilters = { action: 'USER_CREATED' };
      const { result } = renderHook(() => useAuditLog(initialFilters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.clearFilters();
      });

      // Should reset to initial filters
      expect(result.current.filters).toEqual(initialFilters);
    });

    it('should navigate pages', async () => {
      auditService.getAuditLogs.mockResolvedValue({
        content: [],
        number: 0,
        size: 20,
        totalElements: 100,
        totalPages: 5,
      });

      const { result } = renderHook(() => useAuditLog());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.pagination.page).toBe(1);

      act(() => {
        result.current.previousPage();
      });

      expect(result.current.pagination.page).toBe(0);

      act(() => {
        result.current.goToPage(3);
      });

      expect(result.current.pagination.page).toBe(3);
    });
  });

  describe('useAnalytics', () => {
    beforeEach(() => {
      analyticsService.getDashboardAnalytics.mockResolvedValue({ metric: 'dashboard' });
      analyticsService.getAppointmentTrends.mockResolvedValue({ metric: 'trends' });
      analyticsService.getUserGrowth.mockResolvedValue({ metric: 'growth' });
      analyticsService.getSystemHealth.mockResolvedValue({ metric: 'health' });
      analyticsService.getDoctorPerformance.mockResolvedValue({ metric: 'performance' });
    });

    it('should fetch all analytics on mount', async () => {
      const { result } = renderHook(() => useAnalytics());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.dashboardData).toBeTruthy();
      expect(result.current.appointmentTrends).toBeTruthy();
      expect(result.current.userGrowth).toBeTruthy();
      expect(result.current.systemHealth).toBeTruthy();
      expect(result.current.doctorPerformance).toBeTruthy();
    });

    it('should update date range', async () => {
      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newDateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
      };

      act(() => {
        result.current.updateDateRange(newDateRange);
      });

      expect(result.current.dateRange).toEqual(newDateRange);
    });

    it('should refresh analytics', async () => {
      const { result } = renderHook(() => useAnalytics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const callCount = analyticsService.getDashboardAnalytics.mock.calls.length;

      await act(async () => {
        await result.current.refresh();
      });

      expect(analyticsService.getDashboardAnalytics.mock.calls.length).toBeGreaterThan(callCount);
    });
  });

  describe('useExport', () => {
    it('should export users data', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      exportService.exportUsers.mockResolvedValue(mockBlob);
      exportService.generateExportFilename.mockReturnValue('users_export_2024-01-01.csv');
      exportService.downloadExportedFile.mockImplementation(() => {});

      const { result } = renderHook(() => useExport());

      let exportResult;
      await act(async () => {
        exportResult = await result.current.exportUsersData('csv', {});
      });

      expect(exportResult.success).toBe(true);
      expect(exportService.exportUsers).toHaveBeenCalledWith('csv', {});
      expect(result.current.lastExport).toBeTruthy();
    });

    it('should handle export errors', async () => {
      exportService.exportUsers.mockRejectedValue(new Error('Export failed'));

      const { result } = renderHook(() => useExport());

      let exportResult;
      await act(async () => {
        exportResult = await result.current.exportUsersData('csv', {});
      });

      expect(exportResult.success).toBe(false);
      expect(result.current.exportError).toBeTruthy();
    });

    it('should track export progress', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      exportService.exportDoctors.mockResolvedValue(mockBlob);
      exportService.generateExportFilename.mockReturnValue('doctors_export_2024-01-01.csv');
      exportService.downloadExportedFile.mockImplementation(() => {});

      const { result } = renderHook(() => useExport());

      expect(result.current.isExporting).toBe(false);

      await act(async () => {
        await result.current.exportDoctorsData('csv', {});
      });

      // After export completes
      expect(result.current.isExporting).toBe(false);
      expect(result.current.lastExport).toBeTruthy();
    });

    it('should clear export error', async () => {
      exportService.exportAppointments.mockRejectedValue(new Error('Export failed'));

      const { result } = renderHook(() => useExport());

      await act(async () => {
        try {
          await result.current.exportAppointmentsData('csv', {});
        } catch (err) {
          // Expected to fail
        }
      });

      await waitFor(() => {
        expect(result.current.exportError).toBeTruthy();
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.exportError).toBeNull();
    });
  });
});
