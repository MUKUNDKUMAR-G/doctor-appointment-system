


import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute, { PatientRoute, DoctorRoute, AdminRoute } from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import { CircularProgress, Box } from '@mui/material';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const DoctorDashboardPage = lazy(() => import('../pages/DoctorDashboardPage'));
const DoctorProfilePage = lazy(() => import('../pages/DoctorProfilePage'));
const DoctorDetailPage = lazy(() => import('../pages/DoctorDetailPage'));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('../pages/AdminUsersPage'));
const AdminDoctorsPage = lazy(() => import('../pages/AdminDoctorsPage'));
const AdminAppointmentsPage = lazy(() => import('../pages/AdminAppointmentsPage'));
const AdminReportsPage = lazy(() => import('../pages/AdminReportsPage'));
const AdminAuditLogPage = lazy(() => import('../pages/AdminAuditLogPage'));
const FindDoctorsPage = lazy(() => import('../pages/FindDoctorsPage'));
const AppointmentsPage = lazy(() => import('../pages/AppointmentsPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Loading fallback component
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'background.default',
    }}
  >
    <CircularProgress size={48} />
  </Box>
);

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  // Get default redirect path based on user role
  const getDefaultPath = () => {
    if (!isAuthenticated) return '/login';
    
    switch (user?.role) {
      case 'DOCTOR':
        return '/doctor-dashboard';
      case 'ADMIN':
        return '/admin-dashboard';
      case 'PATIENT':
      default:
        return '/dashboard';
    }
  };

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes - no layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to={getDefaultPath()} replace />} />
        
        {/* Protected routes with layout */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Patient-specific routes */}
        <Route 
          path="/dashboard" 
          element={
            <PatientRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </PatientRoute>
          } 
        />
        <Route 
          path="/doctors" 
          element={
            <PatientRoute>
              <Layout>
                <FindDoctorsPage />
              </Layout>
            </PatientRoute>
          } 
        />
        <Route 
          path="/doctors/:doctorId" 
          element={
            <PatientRoute>
              <Layout>
                <DoctorDetailPage />
              </Layout>
            </PatientRoute>
          } 
        />
        <Route 
          path="/appointments" 
          element={
            <PatientRoute>
              <Layout>
                <AppointmentsPage />
              </Layout>
            </PatientRoute>
          } 
        />
        
        {/* Doctor-specific routes */}
        <Route 
          path="/doctor-dashboard" 
          element={
            <DoctorRoute>
              <Layout>
                <DoctorDashboardPage />
              </Layout>
            </DoctorRoute>
          } 
        />
        <Route 
          path="/doctor/profile" 
          element={
            <DoctorRoute>
              <Layout>
                <DoctorProfilePage />
              </Layout>
            </DoctorRoute>
          } 
        />
        <Route 
          path="/doctor/dashboard" 
          element={
            <DoctorRoute>
              <Layout>
                <DoctorDashboardPage />
              </Layout>
            </DoctorRoute>
          } 
        />
        
        {/* Admin-specific routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <AdminRoute>
              <Layout>
                <AdminDashboardPage />
              </Layout>
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <AdminRoute>
              <Layout>
                <AdminUsersPage />
              </Layout>
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/doctors" 
          element={
            <AdminRoute>
              <Layout>
                <AdminDoctorsPage />
              </Layout>
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/appointments" 
          element={
            <AdminRoute>
              <Layout>
                <AdminAppointmentsPage />
              </Layout>
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <AdminRoute>
              <Layout>
                <AdminReportsPage />
              </Layout>
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/audit-logs" 
          element={
            <AdminRoute>
              <Layout>
                <AdminAuditLogPage />
              </Layout>
            </AdminRoute>
          } 
        />
        
        {/* Catch-all route for 404 */}
        <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;