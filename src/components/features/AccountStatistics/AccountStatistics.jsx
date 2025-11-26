import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CalendarToday,
  CheckCircle,
  Schedule,
  LocalHospital,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import ModernCard from '../../common/ModernCard';

const CircularProgressWithLabel = ({ value, color, size = 100, label, icon: Icon }) => {
  const theme = useTheme();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Box sx={{ position: 'relative' }}>
        {/* Background Circle */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={size}
          thickness={4}
          sx={{
            color: alpha(theme.palette[color].main, 0.1),
            position: 'absolute',
          }}
        />
        {/* Progress Circle */}
        <CircularProgress
          variant="determinate"
          value={progress}
          size={size}
          thickness={4}
          sx={{
            color: theme.palette[color].main,
            transition: 'all 1s ease-in-out',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        {/* Center Content */}
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {Icon && (
            <Icon
              sx={{
                fontSize: size * 0.3,
                color: `${color}.main`,
                mb: 0.5,
              }}
            />
          )}
          <Typography
            variant="h6"
            component="div"
            fontWeight={700}
            color={`${color}.main`}
          >
            {`${Math.round(progress)}%`}
          </Typography>
        </Box>
      </Box>
      {label && (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mt: 1 }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
};

const StatItem = ({ icon: Icon, label, value, color, trend, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette[color].main, 0.08),
          border: (theme) => `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
          transition: 'all 0.3s',
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
            transform: 'translateY(-4px)',
            boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette[color].main, 0.2)}`,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette[color].main, 0.15),
              mr: 1.5,
            }}
          >
            <Icon sx={{ color: `${color}.main`, fontSize: 24 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
          {trend !== undefined && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: trend >= 0 ? 'success.main' : 'error.main',
              }}
            >
              {trend >= 0 ? (
                <TrendingUp fontSize="small" />
              ) : (
                <TrendingDown fontSize="small" />
              )}
              <Typography variant="caption" fontWeight={600}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h4" fontWeight={700} color={`${color}.main`}>
          <CountUp end={value} duration={1.5} delay={delay} />
        </Typography>
      </Box>
    </motion.div>
  );
};

const AccountStatistics = ({ stats }) => {
  const {
    total = 0,
    completed = 0,
    upcoming = 0,
    cancelled = 0,
    doctors = 0,
  } = stats || {};

  // Calculate percentages
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const attendanceRate = total > 0 ? Math.round(((completed / (total - cancelled)) * 100)) : 0;
  const upcomingRate = total > 0 ? Math.round((upcoming / total) * 100) : 0;

  // Mock trend data (in real app, this would come from backend)
  const trends = {
    total: 12,
    completed: 8,
    upcoming: 15,
    doctors: 5,
  };

  return (
    <ModernCard variant="elevated">
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Account Statistics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your healthcare journey at a glance
        </Typography>

        {/* Progress Circles */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 3,
            mb: 4,
            justifyItems: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgressWithLabel
                value={completionRate}
                color="success"
                size={100}
                icon={CheckCircle}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Completion Rate
              </Typography>
            </Box>
          </motion.div>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgressWithLabel
                value={attendanceRate}
                color="primary"
                size={100}
                icon={CalendarToday}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Attendance Rate
              </Typography>
            </Box>
          </motion.div>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgressWithLabel
                value={upcomingRate}
                color="warning"
                size={100}
                icon={Schedule}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Upcoming Rate
              </Typography>
            </Box>
          </motion.div>
        </Box>

        {/* Stat Items Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
            },
            gap: 2,
          }}
        >
          <StatItem
            icon={CalendarToday}
            label="Total Appointments"
            value={total}
            color="primary"
            trend={trends.total}
            delay={0.4}
          />
          <StatItem
            icon={CheckCircle}
            label="Completed"
            value={completed}
            color="success"
            trend={trends.completed}
            delay={0.45}
          />
          <StatItem
            icon={Schedule}
            label="Upcoming"
            value={upcoming}
            color="warning"
            trend={trends.upcoming}
            delay={0.5}
          />
          <StatItem
            icon={LocalHospital}
            label="Doctors Visited"
            value={doctors}
            color="info"
            trend={trends.doctors}
            delay={0.55}
          />
        </Box>

        {/* Summary Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              background: (theme) =>
                `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
                  theme.palette.secondary.main,
                  0.1
                )} 100%)`,
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Health Insight:</strong> You've maintained a {attendanceRate}% attendance rate.
              {attendanceRate >= 80 && ' Great job staying on top of your health!'}
              {attendanceRate < 80 && attendanceRate >= 60 && ' Keep up the good work!'}
              {attendanceRate < 60 && ' Consider scheduling regular check-ups.'}
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </ModernCard>
  );
};

export default AccountStatistics;
