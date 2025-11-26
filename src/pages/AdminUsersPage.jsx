import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  People,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminPageHeader from '../components/features/AdminPageHeader/AdminPageHeader';
import { UserManagementTable, UserBulkActionsPanel } from '../components/features/UserManagement';
import ExportButton from '../components/features/ExportButton';
import ExportProgressIndicator from '../components/features/ExportProgressIndicator';
import { useBulkActions } from '../hooks/useBulkActions';
import { useExport } from '../hooks/useExport';
import { 
  getAllUsers, 
  updateUserStatus, 
  deleteUser,
  bulkEnableUsers,
  bulkDisableUsers,
  bulkDeleteUsers,
  bulkChangeUserRoles,
} from '../services/adminService';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  
  // Bulk actions hook
  const bulkSelection = useBulkActions();
  
  // Export hook
  const {
    exportUsersData,
    isExporting,
    exportProgress,
    exportError,
  } = useExport();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Handle individual user actions
  const handleUserAction = async (action, user) => {
    try {
      switch (action) {
        case 'toggle-status':
          await updateUserStatus(user.id, !user.enabled);
          toast.success(`User ${!user.enabled ? 'enabled' : 'disabled'} successfully`);
          break;
        case 'delete':
          setDeleteDialog({ open: true, user });
          return; // Don't refresh yet
        default:
          console.warn('Unknown action:', action);
      }
      await fetchUsers();
    } catch (err) {
      console.error('Error performing user action:', err);
      toast.error(`Failed to ${action} user`);
    }
  };

  // Handle delete confirmation
  const handleDeleteUser = async () => {
    try {
      await deleteUser(deleteDialog.user.id);
      setDeleteDialog({ open: false, user: null });
      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    const selectedIds = bulkSelection.selectedItems;
    
    if (selectedIds.length === 0) {
      toast.error('No users selected');
      return;
    }

    try {
      let result;
      
      switch (action) {
        case 'enable':
          result = await bulkSelection.executeBulkAction(
            () => bulkEnableUsers(selectedIds)
          );
          toast.success(`${result.successCount} users enabled successfully`);
          break;
          
        case 'disable':
          result = await bulkSelection.executeBulkAction(
            () => bulkDisableUsers(selectedIds)
          );
          toast.success(`${result.successCount} users disabled successfully`);
          break;
          
        case 'delete':
          result = await bulkSelection.executeBulkAction(
            () => bulkDeleteUsers(selectedIds)
          );
          toast.success(`${result.successCount} users deleted successfully`);
          break;
          
        case 'change-role-patient':
          result = await bulkSelection.executeBulkAction(
            () => bulkChangeUserRoles(selectedIds, 'PATIENT')
          );
          toast.success(`${result.successCount} users changed to Patient role`);
          break;
          
        case 'change-role-doctor':
          result = await bulkSelection.executeBulkAction(
            () => bulkChangeUserRoles(selectedIds, 'DOCTOR')
          );
          toast.success(`${result.successCount} users changed to Doctor role`);
          break;
          
        default:
          toast.error('Unknown bulk action');
          return;
      }

      // Show errors if any
      if (result.failureCount > 0) {
        toast.error(`${result.failureCount} operations failed`);
      }

      await fetchUsers();
    } catch (err) {
      console.error('Error performing bulk action:', err);
      toast.error('Failed to perform bulk action');
    }
  };

  // Handle export
  const handleExport = async (format) => {
    try {
      const result = await exportUsersData(format);
      if (result.success) {
        toast.success(`Users exported successfully as ${format.toUpperCase()}`);
      } else {
        toast.error(result.error || 'Export failed');
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export users');
    }
  };

  const breadcrumbs = [
    { label: 'Users', icon: People }
  ];

  const headerActions = (
    <ExportButton
      onExport={handleExport}
      formats={['csv', 'excel', 'pdf']}
      disabled={loading || users.length === 0}
      loading={isExporting}
      progress={exportProgress}
      label="Export Users"
    />
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs and Header */}
      <AdminPageHeader
        title="User Management"
        subtitle="View and manage all system users"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Bulk Actions Panel */}
      <UserBulkActionsPanel
        selectedCount={bulkSelection.selectedCount}
        onBulkAction={handleBulkAction}
        onClearSelection={bulkSelection.clearSelection}
        isProcessing={bulkSelection.isProcessing}
        processingProgress={bulkSelection.processingProgress}
      />

      {/* User Management Table */}
      <UserManagementTable
        users={users}
        onAction={handleUserAction}
        onBulkAction={handleBulkAction}
        loading={loading}
        bulkSelection={bulkSelection}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, user: null })}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{deleteDialog.user?.firstName} {deleteDialog.user?.lastName}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Progress Indicator */}
      <ExportProgressIndicator
        progress={exportProgress}
        show={isExporting || exportProgress !== null}
        onClose={() => {}}
      />
    </Container>
  );
};

export default AdminUsersPage;
