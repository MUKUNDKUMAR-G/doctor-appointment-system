import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  exportUsers,
  exportDoctors,
  exportAppointments,
  downloadExportedFile,
  generateExportFilename,
  exportAndDownload,
} from '../exportService';
import api from '../api';

// Mock the api module
vi.mock('../api');

describe('Export Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock URL.createObjectURL and revokeObjectURL
    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = vi.fn();
    }
    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = vi.fn();
    }
  });

  describe('generateExportFilename', () => {
    it('should generate filename with correct format for CSV', () => {
      const filename = generateExportFilename('users', 'csv');
      expect(filename).toMatch(/^users_export_\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should generate filename with correct format for Excel', () => {
      const filename = generateExportFilename('doctors', 'excel');
      expect(filename).toMatch(/^doctors_export_\d{4}-\d{2}-\d{2}\.xlsx$/);
    });

    it('should generate filename with correct format for PDF', () => {
      const filename = generateExportFilename('appointments', 'pdf');
      expect(filename).toMatch(/^appointments_export_\d{4}-\d{2}-\d{2}\.pdf$/);
    });
  });

  describe('exportUsers', () => {
    it('should call API with correct parameters', async () => {
      const mockBlob = new Blob(['test data'], { type: 'text/csv' });
      api.post.mockResolvedValue({ data: mockBlob });

      const result = await exportUsers('csv', { role: 'PATIENT' });

      expect(api.post).toHaveBeenCalledWith(
        '/api/admin/export/users',
        { format: 'csv', filters: { role: 'PATIENT' } },
        { responseType: 'blob' }
      );
      expect(result).toBe(mockBlob);
    });

    it('should handle export errors', async () => {
      api.post.mockRejectedValue(new Error('Export failed'));

      await expect(exportUsers('csv')).rejects.toThrow('Export failed');
    });
  });

  describe('exportDoctors', () => {
    it('should call API with correct parameters', async () => {
      const mockBlob = new Blob(['test data'], { type: 'text/csv' });
      api.post.mockResolvedValue({ data: mockBlob });

      const result = await exportDoctors('excel', { specialization: 'Cardiology' });

      expect(api.post).toHaveBeenCalledWith(
        '/api/admin/export/doctors',
        { format: 'excel', filters: { specialization: 'Cardiology' } },
        { responseType: 'blob' }
      );
      expect(result).toBe(mockBlob);
    });
  });

  describe('exportAppointments', () => {
    it('should call API with correct parameters', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/pdf' });
      api.post.mockResolvedValue({ data: mockBlob });

      const result = await exportAppointments('pdf', { status: 'SCHEDULED' });

      expect(api.post).toHaveBeenCalledWith(
        '/api/admin/export/appointments',
        { format: 'pdf', filters: { status: 'SCHEDULED' } },
        { responseType: 'blob' }
      );
      expect(result).toBe(mockBlob);
    });
  });

  describe('downloadExportedFile', () => {
    it('should create download link and trigger download', () => {
      // Mock DOM methods
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
      const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      const revokeObjectURLSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

      const blob = new Blob(['test'], { type: 'text/csv' });
      downloadExportedFile(blob, 'test.csv');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
      expect(mockLink.href).toBe('blob:mock-url');
      expect(mockLink.download).toBe('test.csv');
      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');

      // Cleanup
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });
  });

  describe('exportAndDownload', () => {
    it('should export and download successfully', async () => {
      const mockBlob = new Blob(['test data'], { type: 'text/csv' });
      const mockExportFn = vi.fn().mockResolvedValue(mockBlob);
      
      // Mock download function
      const createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: vi.fn(),
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
      vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

      const result = await exportAndDownload(mockExportFn, 'users', 'csv', {});

      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/^users_export_\d{4}-\d{2}-\d{2}\.csv$/);
      expect(mockExportFn).toHaveBeenCalledWith('csv', {});

      // Cleanup
      createObjectURLSpy.mockRestore();
      createElementSpy.mockRestore();
    });

    it('should retry on failure and eventually succeed', async () => {
      const mockBlob = new Blob(['test data'], { type: 'text/csv' });
      const mockExportFn = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockBlob);
      
      // Mock download function
      vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock-url');
      vi.spyOn(document, 'createElement').mockReturnValue({
        href: '',
        download: '',
        click: vi.fn(),
      });
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
      vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

      const result = await exportAndDownload(mockExportFn, 'users', 'csv', {}, 2);

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
      expect(mockExportFn).toHaveBeenCalledTimes(2);
    });

    it('should fail after all retries exhausted', async () => {
      const mockExportFn = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(exportAndDownload(mockExportFn, 'users', 'csv', {}, 1))
        .rejects.toThrow();

      expect(mockExportFn).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });

    it('should reject empty blob', async () => {
      const emptyBlob = new Blob([], { type: 'text/csv' });
      const mockExportFn = vi.fn().mockResolvedValue(emptyBlob);

      await expect(exportAndDownload(mockExportFn, 'users', 'csv', {}, 0))
        .rejects.toThrow('Export returned empty data');
    });
  });
});
