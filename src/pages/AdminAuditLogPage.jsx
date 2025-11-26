import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Button,
} from '@mui/material';
import { Download, Refresh, History } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuditLog } from '../hooks/useAuditLog';
import { useExport } from '../hooks/useExport';
import AdminPageHeader from '../components/features/AdminPageHeader/AdminPageHeader';
import AuditLogTimeline from '../components/features/AuditLog/AuditLogTimeline';
import AuditLogFilterPanel from '../components/features/AuditLog/AuditLogFilterPanel';
import { useToast } from '../components/common/Toast/ToastProvider';

const AdminAuditLogPage = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    logs,
    loading,
    error,
    filters,
    pagination,
    updateFilter,
    updateFilters,
    clearFilters,
    clearFilter,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    refresh,
    isFilterActive,
    getActiveFilterCount,
    hasNextPage,
    hasPreviousPage,
  } = useAuditLog();

  const { exportAuditLogsData, isExporting } = useExport();

  const handleExport = async (format) => {
    try {
      const result = await exportAuditLogsData(format, filters);
      if (result.success) {
        showToast('Audit logs exported successfully', 'success');
      } else {
        showToast('Failed to export audit logs', 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast('Failed to export audit logs', 'error');
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    updateFilter('search', term);
  };

  const handleRefresh = async () => {
    await refresh();
    showToast('Audit logs refreshed', 'success');
  };

  const breadcrumbs = [
    { label: 'Audit Log', icon: History }
  ];

  const headerActions = (
    <Box display="flex" gap={2}>
      <Button
        variant="outlined"
        startIcon={<Refresh />}
        onClick={handleRefresh}
        disabled={loading}
      >
        Refresh
      </Button>
      <Button
        variant="contained"
        startIcon={<Download />}
        onClick={() => handleExport('csv')}
        disabled={isExporting || logs.length === 0}
      >
        Export
      </Button>
    </Box>
  );

  return (
    <Container
      maxWidth="lg"
      sx={{ mt: 4, mb: 4 }}
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Breadcrumbs and Header */}
      <AdminPageHeader
        title="Audit Log"
        subtitle="View and monitor all administrative actions and system events"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filter Panel */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <AuditLogFilterPanel
          filters={filters}
          onFilterChange={updateFilter}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          onClearFilter={clearFilter}
          isFilterActive={isFilterActive}
          activeFilterCount={getActiveFilterCount()}
          searchTerm={searchTerm}
          onSearch={handleSearch}
        />
      </Paper>

      {/* Timeline */}
      {loading && logs.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <AuditLogTimeline
          logs={logs}
          loading={loading}
          pagination={pagination}
          onPageChange={goToPage}
          onNextPage={nextPage}
          onPreviousPage={previousPage}
          onPageSizeChange={changePageSize}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
        />
      )}
    </Container>
  );
};

export default AdminAuditLogPage;
