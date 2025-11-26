import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminPageHeader from '../../../features/AdminPageHeader/AdminPageHeader';
import BulkActionToolbar from '../../../features/BulkActionToolbar/BulkActionToolbar';
import ExportButton from '../../../features/ExportButton/ExportButton';
import NotificationCenter from '../../../features/NotificationCenter/NotificationCenter';
import { People, Delete } from '@mui/icons-material';

describe('Admin Shared Components Integration', () => {
  describe('AdminPageHeader', () => {
    it('should render title and subtitle', () => {
      render(
        <BrowserRouter>
          <AdminPageHeader
            title="Test Page"
            subtitle="Test subtitle"
          />
        </BrowserRouter>
      );

      expect(screen.getByText('Test Page')).toBeInTheDocument();
      expect(screen.getByText('Test subtitle')).toBeInTheDocument();
    });

    it('should render breadcrumbs', () => {
      render(
        <BrowserRouter>
          <AdminPageHeader
            title="Test Page"
            breadcrumbs={[
              { label: 'Users', path: '/admin/users', icon: People }
            ]}
          />
        </BrowserRouter>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(
        <BrowserRouter>
          <AdminPageHeader
            title="Test Page"
            actions={<button>Test Action</button>}
          />
        </BrowserRouter>
      );

      expect(screen.getByText('Test Action')).toBeInTheDocument();
    });
  });

  describe('BulkActionToolbar', () => {
    it('should not render when selectedCount is 0', () => {
      const { container } = render(
        <BulkActionToolbar
          selectedCount={0}
          actions={[]}
          onClear={vi.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when items are selected', () => {
      render(
        <BulkActionToolbar
          selectedCount={5}
          actions={[
            { label: 'Delete', onClick: vi.fn(), icon: Delete }
          ]}
          onClear={vi.fn()}
        />
      );

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('items selected')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should call onClear when close button is clicked', () => {
      const onClear = vi.fn();
      render(
        <BulkActionToolbar
          selectedCount={5}
          actions={[]}
          onClear={onClear}
        />
      );

      const closeButton = screen.getByLabelText('Clear selection');
      fireEvent.click(closeButton);

      expect(onClear).toHaveBeenCalled();
    });

    it('should call action onClick when action button is clicked', () => {
      const onDelete = vi.fn();
      render(
        <BulkActionToolbar
          selectedCount={5}
          actions={[
            { label: 'Delete', onClick: onDelete, icon: Delete }
          ]}
          onClear={vi.fn()}
        />
      );

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalled();
    });
  });

  describe('ExportButton', () => {
    it('should render export button', () => {
      render(
        <ExportButton
          onExport={vi.fn()}
        />
      );

      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('should show menu when clicked', async () => {
      render(
        <ExportButton
          onExport={vi.fn()}
          formats={['csv', 'excel', 'pdf']}
        />
      );

      const button = screen.getByText('Export');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Export as CSV')).toBeInTheDocument();
        expect(screen.getByText('Export as Excel')).toBeInTheDocument();
        expect(screen.getByText('Export as PDF')).toBeInTheDocument();
      });
    });

    it('should call onExport with format when menu item is clicked', async () => {
      const onExport = vi.fn();
      render(
        <ExportButton
          onExport={onExport}
          formats={['csv']}
        />
      );

      const button = screen.getByText('Export');
      fireEvent.click(button);

      await waitFor(() => {
        const csvOption = screen.getByText('Export as CSV');
        fireEvent.click(csvOption);
      });

      expect(onExport).toHaveBeenCalledWith('csv');
    });

    it('should show loading state', () => {
      render(
        <ExportButton
          onExport={vi.fn()}
          loading={true}
        />
      );

      expect(screen.getByText('Exporting...')).toBeInTheDocument();
    });
  });

  describe('NotificationCenter', () => {
    const mockNotifications = [
      {
        id: 1,
        message: 'Test notification 1',
        severity: 'info',
        timestamp: new Date(),
        read: false,
      },
      {
        id: 2,
        message: 'Test notification 2',
        severity: 'success',
        timestamp: new Date(),
        read: true,
      },
    ];

    it('should render notification button with badge', () => {
      render(
        <NotificationCenter
          notifications={mockNotifications}
          onDismiss={vi.fn()}
          onDismissAll={vi.fn()}
          onMarkAllRead={vi.fn()}
        />
      );

      expect(screen.getByLabelText(/Notifications/)).toBeInTheDocument();
    });

    it('should open drawer when button is clicked', async () => {
      render(
        <NotificationCenter
          notifications={mockNotifications}
          onDismiss={vi.fn()}
          onDismissAll={vi.fn()}
          onMarkAllRead={vi.fn()}
        />
      );

      const button = screen.getByLabelText(/Notifications/);
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
        expect(screen.getByText('Test notification 1')).toBeInTheDocument();
        expect(screen.getByText('Test notification 2')).toBeInTheDocument();
      });
    });

    it('should show empty state when no notifications', async () => {
      render(
        <NotificationCenter
          notifications={[]}
          onDismiss={vi.fn()}
          onDismissAll={vi.fn()}
          onMarkAllRead={vi.fn()}
        />
      );

      const button = screen.getByLabelText(/Notifications/);
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('No notifications')).toBeInTheDocument();
        expect(screen.getByText("You're all caught up!")).toBeInTheDocument();
      });
    });

    it('should call onMarkAllRead when mark all read button is clicked', async () => {
      const onMarkAllRead = vi.fn();
      render(
        <NotificationCenter
          notifications={mockNotifications}
          onDismiss={vi.fn()}
          onDismissAll={vi.fn()}
          onMarkAllRead={onMarkAllRead}
        />
      );

      const button = screen.getByLabelText(/Notifications/);
      fireEvent.click(button);

      await waitFor(() => {
        const markAllButton = screen.getByLabelText('Mark all as read');
        fireEvent.click(markAllButton);
      });

      expect(onMarkAllRead).toHaveBeenCalled();
    });

    it('should call onDismissAll when clear all button is clicked', async () => {
      const onDismissAll = vi.fn();
      render(
        <NotificationCenter
          notifications={mockNotifications}
          onDismiss={vi.fn()}
          onDismissAll={onDismissAll}
          onMarkAllRead={vi.fn()}
        />
      );

      const button = screen.getByLabelText(/Notifications/);
      fireEvent.click(button);

      await waitFor(() => {
        const clearAllButton = screen.getByLabelText('Clear all notifications');
        fireEvent.click(clearAllButton);
      });

      expect(onDismissAll).toHaveBeenCalled();
    });
  });
});
