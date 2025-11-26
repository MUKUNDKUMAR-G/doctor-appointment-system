import { memo, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CalendarToday,
  People,
  CheckCircle,
  Cancel,
  EventBusy,
  AttachMoney,
  Schedule,
  Repeat,
} from '@mui/icons-material';
import { motion, useAnimation } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { staggerContainer, staggerItem, getAccessibleVariants } from '../../../theme/animations';
import ModernCard from '../../common/ModernCard';

// Animated counter component
const AnimatedCounter = memo(({ value, duration = 2000, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setCount(value);
      return;
    }

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration, prefersReducedMotion]);

  return (
    <Typography
      variant="h3"
      component="span"
      fontWeight={700}
      sx={{
        background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </Typography>
  );
});

AnimatedCounter.displayName = 'AnimatedCounter';

// Single statistic card
const StatCard = memo(({
  icon: Icon,
  label,
  value,
  suffix = '',
  prefix = '',
  trend,
  trendValue,
  color = 'primary',
  animated = true,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const colorMap = {
    primary: {
      bg: 'primary.50',
      icon: 'primary.main',
      gradient: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
    },
    success: {
      bg: 'success.50',
      icon: 'success.main',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    },
    warning: {
      bg: 'warning.50',
      icon: 'warning.main',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    },
    error: {
      bg: 'error.50',
      icon: 'error.main',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    },
    info: {
      bg: 'info.50',
      icon: 'info.main',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    },
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <ModernCard
      component={motion.div}
      variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
      hover
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: colors.gradient,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Icon */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: colors.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Icon sx={{ fontSize: 32, color: colors.icon }} />
        </Box>

        {/* Value */}
        <Box mb={1}>
          {animated && typeof value === 'number' ? (
            <AnimatedCounter value={value} suffix={suffix} prefix={prefix} />
          ) : (
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{
                background: colors.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </Typography>
          )}
        </Box>

        {/* Label */}
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={600}
          gutterBottom
        >
          {label}
        </Typography>

        {/* Trend */}
        {trend && trendValue !== undefined && (
          <Box display="flex" alignItems="center" gap={0.5} mt={1}>
            {trend === 'up' ? (
              <TrendingUp sx={{ fontSize: 18, color: 'success.main' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 18, color: 'error.main' }} />
            )}
            <Typography
              variant="caption"
              fontWeight={600}
              color={trend === 'up' ? 'success.main' : 'error.main'}
            >
              {trendValue}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </ModernCard>
  );
});

StatCard.displayName = 'StatCard';

const DoctorStatisticsCard = memo(({ statistics }) => {
  const prefersReducedMotion = useReducedMotion();

  const {
    totalAppointments = 0,
    completedAppointments = 0,
    cancelledAppointments = 0,
    noShowAppointments = 0,
    totalPatients = 0,
    returningPatients = 0,
    avgConsultationTime = 0,
    totalRevenue = 0,
    trends = {},
  } = statistics || {};

  // Calculate derived metrics
  const completionRate = totalAppointments > 0
    ? Math.round((completedAppointments / totalAppointments) * 100)
    : 0;

  const retentionRate = totalPatients > 0
    ? Math.round((returningPatients / totalPatients) * 100)
    : 0;

  const cancellationRate = totalAppointments > 0
    ? Math.round((cancelledAppointments / totalAppointments) * 100)
    : 0;

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Format time
  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Empty state
  if (!statistics) {
    return (
      <ModernCard>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <CalendarToday sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Statistics Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Statistics will be displayed once you have appointments.
          </Typography>
        </CardContent>
      </ModernCard>
    );
  }

  return (
    <Box
      component={motion.div}
      variants={getAccessibleVariants(staggerContainer, prefersReducedMotion)}
      initial="initial"
      animate="animate"
    >
      <Grid container spacing={3}>
        {/* Total Appointments */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            icon={CalendarToday}
            label="Total Appointments"
            value={totalAppointments}
            color="primary"
            trend={trends.appointments}
            trendValue={trends.appointmentsValue}
          />
        </Grid>

        {/* Completed Appointments */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={completedAppointments}
            color="success"
            trend={trends.completed}
            trendValue={trends.completedValue}
          />
        </Grid>

        {/* Total Patients */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            icon={People}
            label="Total Patients"
            value={totalPatients}
            color="info"
            trend={trends.patients}
            trendValue={trends.patientsValue}
          />
        </Grid>

        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            icon={AttachMoney}
            label="Total Revenue"
            value={formatCurrency(totalRevenue)}
            color="success"
            animated={false}
            trend={trends.revenue}
            trendValue={trends.revenueValue}
          />
        </Grid>

        {/* Completion Rate */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <ModernCard
            component={motion.div}
            variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
            hover
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: 'success.50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <CheckCircle sx={{ fontSize: 32, color: 'success.main' }} />
              </Box>

              <Typography variant="h3" fontWeight={700} color="success.main" gutterBottom>
                {completionRate}%
              </Typography>

              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                Completion Rate
              </Typography>

              <LinearProgress
                variant="determinate"
                value={completionRate}
                color="success"
                sx={{
                  height: 6,
                  borderRadius: 3,
                  mt: 2,
                }}
              />
            </CardContent>
          </ModernCard>
        </Grid>

        {/* Patient Retention */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <ModernCard
            component={motion.div}
            variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
            hover
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: 'primary.50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Repeat sx={{ fontSize: 32, color: 'primary.main' }} />
              </Box>

              <Typography variant="h3" fontWeight={700} color="primary.main" gutterBottom>
                {retentionRate}%
              </Typography>

              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                Patient Retention
              </Typography>

              <LinearProgress
                variant="determinate"
                value={retentionRate}
                color="primary"
                sx={{
                  height: 6,
                  borderRadius: 3,
                  mt: 2,
                }}
              />
            </CardContent>
          </ModernCard>
        </Grid>

        {/* Avg Consultation Time */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            icon={Schedule}
            label="Avg Consultation Time"
            value={formatTime(avgConsultationTime)}
            color="info"
            animated={false}
          />
        </Grid>

        {/* Cancelled Appointments */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            icon={Cancel}
            label="Cancelled"
            value={cancelledAppointments}
            color="warning"
          />
        </Grid>

        {/* No-Show Appointments */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <StatCard
            icon={EventBusy}
            label="No-Show"
            value={noShowAppointments}
            color="error"
          />
        </Grid>

        {/* Cancellation Rate */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <ModernCard
            component={motion.div}
            variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
            hover
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: 'warning.50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Cancel sx={{ fontSize: 32, color: 'warning.main' }} />
              </Box>

              <Typography variant="h3" fontWeight={700} color="warning.main" gutterBottom>
                {cancellationRate}%
              </Typography>

              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                Cancellation Rate
              </Typography>

              <LinearProgress
                variant="determinate"
                value={cancellationRate}
                color="warning"
                sx={{
                  height: 6,
                  borderRadius: 3,
                  mt: 2,
                }}
              />
            </CardContent>
          </ModernCard>
        </Grid>
      </Grid>
    </Box>
  );
});

DoctorStatisticsCard.displayName = 'DoctorStatisticsCard';

export default DoctorStatisticsCard;
