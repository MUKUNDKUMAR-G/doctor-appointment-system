import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  Search,
  FilterList,
  Block,
  CheckCircle,
  Delete,
  Edit,
  Person,
} from '@mui/icons-material';
import { useDebounce } from '../../../hooks/useDebounce';
import { format, parseISO } from 'date-fns';
import VirtualTable from '../../common/VirtualTable';

// Memoized user row component for better performance
const UserRow = memo(({ user, isSelected, onToggle, onAction, getRoleColor, getUserInitials }) => {
  const handleToggle = useCallback(() => onToggle(user.id), [onToggle, user.id]);
  const handleToggleStatus = useCallback(() => onAction('toggle-status', user), [onAction, user]);
  const handleDelete = useCallback(() => onAction('delete', user), [onAction, user]);

  return (
    <TableRow hover selected={isSelected}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={isSelected}
          onChange={handleToggle}
          aria-label={`Select ${user.firstName} ${user.lastName}`}
        />
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={user.avatarUrl}
            alt={`${user.firstName} ${user.lastName}`}
            sx={{ width: 40, height: 40 }}
          >
            {getUserInitials(user)}
          </Avatar>
          <Typography variant="body2" fontWeight="500">
            {user.firstName} {user.lastName}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Chip 
          label={user.role} 
          size="small" 
          color={getRoleColor(user.role)}
          aria-label={`Role: ${user.role}`}
        />
      </TableCell>
      <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
      <TableCell>
        <Chip 
          label={user.enabled ? 'Active' : 'Disabled'} 
          size="small" 
          color={user.enabled ? 'success' : 'default'}
          icon={user.enabled ? <CheckCircle /> : <Block />}
          aria-label={`Status: ${user.enabled ? 'Active' : 'Disabled'}`}
        />
      </TableCell>
      <TableCell>
        {user.createdAt ? format(parseISO(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
      </TableCell>
      <TableCell align="center">
        <IconButton
          size="small"
          color={user.enabled ? 'warning' : 'success'}
          onClick={handleToggleStatus}
          aria-label={user.enabled ? 'Disable user' : 'Enable user'}
        >
          {user.enabled ? <Block /> : <CheckCircle />}
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={handleDelete}
          disabled={user.role === 'ADMIN'}
          aria-label="Delete user"
        >
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.user.id === nextProps.user.id &&
    prevProps.user.enabled === nextProps.user.enabled &&
    prevProps.isSelected === nextProps.isSelected
  );
});

UserRow.displayName = 'UserRow';

/**
 * UserManagementTable Component
 * Advanced table for managing users with search, filters, and bulk selection
 * Optimized with memoization and virtual scrolling for large datasets
 * 
 * @param {Array} users - Array of user objects
 * @param {Function} onAction - Callback for user actions (enable, disable, delete)
 * @param {Function} onBulkAction - Callback for bulk actions
 * @param {boolean} loading - Loading state
 * @param {Object} bulkSelection - Bulk selection state from useBulkActions hook
 * @param {boolean} useVirtualScrolling - Enable virtual scrolling for large datasets (default: false)
 */
const UserManagementTable = memo(({
  users = [],
  onAction,
  onBulkAction,
  loading = false,
  bulkSelection,
  useVirtualScrolling = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Debounce search query for better performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch = !debouncedSearch || 
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phoneNumber?.includes(searchLower);

      // Role filter
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      // Status filter
      const matchesStatus = statusFilter === 'ALL' || 
        (statusFilter === 'ACTIVE' && user.enabled) ||
        (statusFilter === 'DISABLED' && !user.enabled);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, debouncedSearch, roleFilter, statusFilter]);

  // Get user IDs for bulk selection
  const userIds = useMemo(() => filteredUsers.map(u => u.id), [filteredUsers]);

  // Handle select all checkbox
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      bulkSelection.selectAll(userIds);
    } else {
      bulkSelection.clearSelection();
    }
  };

  // Memoized helper functions
  const getRoleColor = useCallback((role) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'DOCTOR': return 'primary';
      case 'PATIENT': return 'success';
      default: return 'default';
    }
  }, []);

  const getUserInitials = useCallback((user) => {
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  }, []);

  // Memoized toggle handler
  const handleToggleItem = useCallback((userId) => {
    bulkSelection.toggleItem(userId);
  }, [bulkSelection]);

  // Render loading skeleton
  if (loading) {
    return (
      <Box>
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} height={60} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <Box>
        {/* Search and Filters */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            aria-label="Search users"
          />
          
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Role"
                aria-label="Filter by role"
              >
                <MenuItem value="ALL">All Roles</MenuItem>
                <MenuItem value="PATIENT">Patient</MenuItem>
                <MenuItem value="DOCTOR">Doctor</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
                aria-label="Filter by status"
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="DISABLED">Disabled</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        {/* User Cards */}
        {filteredUsers.map((user) => (
          <Card key={user.id} sx={{ mb: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Checkbox
                  checked={bulkSelection.isSelected(user.id)}
                  onChange={() => bulkSelection.toggleItem(user.id)}
                  aria-label={`Select ${user.firstName} ${user.lastName}`}
                />
                
                <Avatar
                  src={user.avatarUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  sx={{ width: 48, height: 48 }}
                >
                  {getUserInitials(user)}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="600">
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      color={getRoleColor(user.role)}
                      aria-label={`Role: ${user.role}`}
                    />
                    <Chip 
                      label={user.enabled ? 'Active' : 'Disabled'} 
                      size="small" 
                      color={user.enabled ? 'success' : 'default'}
                      icon={user.enabled ? <CheckCircle /> : <Block />}
                      aria-label={`Status: ${user.enabled ? 'Active' : 'Disabled'}`}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <IconButton
                      size="small"
                      color={user.enabled ? 'warning' : 'success'}
                      onClick={() => onAction('toggle-status', user)}
                      aria-label={user.enabled ? 'Disable user' : 'Enable user'}
                    >
                      {user.enabled ? <Block /> : <CheckCircle />}
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onAction('delete', user)}
                      disabled={user.role === 'ADMIN'}
                      aria-label="Delete user"
                    >
                      <Delete />
                    </IconButton>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No users found
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // Desktop table view
  return (
    <Box>
      {/* Search and Filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
        <TextField
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          aria-label="Search users"
        />
        
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>Role</InputLabel>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label="Role"
            aria-label="Filter by role"
          >
            <MenuItem value="ALL">All Roles</MenuItem>
            <MenuItem value="PATIENT">Patient</MenuItem>
            <MenuItem value="DOCTOR">Doctor</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
            aria-label="Filter by status"
          >
            <MenuItem value="ALL">All Status</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="DISABLED">Disabled</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Active Filters Display */}
      {(roleFilter !== 'ALL' || statusFilter !== 'ALL' || debouncedSearch) && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
          {debouncedSearch && (
            <Chip
              label={`Search: "${debouncedSearch}"`}
              onDelete={() => setSearchQuery('')}
              size="small"
              aria-label={`Active filter: Search "${debouncedSearch}"`}
            />
          )}
          {roleFilter !== 'ALL' && (
            <Chip
              label={`Role: ${roleFilter}`}
              onDelete={() => setRoleFilter('ALL')}
              size="small"
              aria-label={`Active filter: Role ${roleFilter}`}
            />
          )}
          {statusFilter !== 'ALL' && (
            <Chip
              label={`Status: ${statusFilter}`}
              onDelete={() => setStatusFilter('ALL')}
              size="small"
              aria-label={`Active filter: Status ${statusFilter}`}
            />
          )}
        </Stack>
      )}

      {/* Table - Use virtual scrolling for large datasets */}
      {useVirtualScrolling && filteredUsers.length > 50 ? (
        <VirtualTable
          data={filteredUsers}
          rowHeight={60}
          renderHeader={() => (
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={bulkSelection.areAllSelected(userIds)}
                  indeterminate={bulkSelection.areSomeSelected(userIds)}
                  onChange={handleSelectAll}
                  aria-label="Select all users"
                />
              </TableCell>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          )}
          renderRow={(user) => (
            <UserRow
              key={user.id}
              user={user}
              isSelected={bulkSelection.isSelected(user.id)}
              onToggle={handleToggleItem}
              onAction={onAction}
              getRoleColor={getRoleColor}
              getUserInitials={getUserInitials}
            />
          )}
          aria-label="User management table"
        />
      ) : (
        <TableContainer>
          <Table aria-label="User management table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={bulkSelection.areAllSelected(userIds)}
                    indeterminate={bulkSelection.areSomeSelected(userIds)}
                    onChange={handleSelectAll}
                    aria-label="Select all users"
                  />
                </TableCell>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isSelected={bulkSelection.isSelected(user.id)}
                  onToggle={handleToggleItem}
                  onAction={onAction}
                  getRoleColor={getRoleColor}
                  getUserInitials={getUserInitials}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {filteredUsers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No users found
          </Typography>
        </Box>
      )}
    </Box>
  );
});

UserManagementTable.displayName = 'UserManagementTable';

export default UserManagementTable;
