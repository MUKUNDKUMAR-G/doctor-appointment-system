import { 
  Container, 
  Typography, 
  Grid, 
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People,
  LocalHospital,
  CalendarToday,
  Assessment,
  History,
  Dashboard,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import StatCard from '../components/common/StatCard';
import AdminPageHeader from '../components/features/AdminPageHeader/AdminPageHeader';
import AdminWelcomeHeader from '../components/features/AdminWelcomeHeader';
import AdminQuickActions from '../components/features/AdminQuickActions';
import AdminActivityTimeline from '../components/features/AdminActivityTimeline';
import { useAdminStats } from '../hooks/useAdminStats';
import { colors } from '../theme/colors';
import RealTimeStatusIndicator from '../components/common/RealTimeStatusIndicator';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, loading, error, recentActivity } = useAdminStats();

  const adminActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      icon: <People />,
      gradient: colors.gradients.primary,
      onClick: () => navigate('/admin/users'),
    },
    {
      title: 'Manage Doctors',
      description: 'View and manage doctors',
      icon: <LocalHospital />,
      gradient: colors.gradients.secondary,
      onClick: () => navigate('/admin/doctors'),
    },
    {
      title: 'View Appointments',
      description: 'Monitor all appointments',
      icon: <CalendarToday />,
      gradient: colors.gradients.info,
      onClick: () => navigate('/admin/appointments'),
    },
    {
      title: 'Reports',
      description: 'View system reports',
      icon: <Assessment />,
      gradient: colors.gradients.success,
      onClick: () => navigate('/admin/reports'),
    },
    {
      title: 'Audit Log',
      description: 'View admin activity logs',
      icon: <History />,
      gradient: colors.gradients.warning,
      onClick: () => navigate('/admin/audit-logs'),
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', icon: Dashboard }
  ];

  return (
    <Container
      maxWidth="lg"
      sx={{ mt: 4, mb: 4 }}
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Breadcrumbs */}
      <AdminPageHeader
        title="Admin Dashboard"
        subtitle="Monitor system health and manage key functions"
        breadcrumbs={breadcrumbs}
      />
      
      {/* Glassmorphism Welcome Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <AdminWelcomeHeader userName={user?.firstName || 'Administrator'} />
        </Box>
        <Box>
          <RealTimeStatusIndicator />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Animated Stat Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          System Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              value={stats?.totalUsers || 0}
              label="Total Users"
              icon={<People />}
              color="primary"
              animated
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              value={stats?.activeDoctors || 0}
              label="Active Doctors"
              icon={<LocalHospital />}
              color="secondary"
              animated
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              value={stats?.todayAppointments || 0}
              label="Today's Appointments"
              icon={<CalendarToday />}
              color="info"
              animated
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              value={stats?.totalAppointments || 0}
              label="Total Appointments"
              icon={<Assessment />}
              color="success"
              animated
            />
          </Grid>
        </Grid>
      </Box>

      {/* Quick Actions with Gradient Icons */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Quick Actions
        </Typography>
        <AdminQuickActions actions={adminActions} />
      </Box>

      {/* Activity Timeline with Color-Coded Statuses */}
      <AdminActivityTimeline activities={recentActivity || []} />
    </Container>
  );
};

export default AdminDashboardPage;
