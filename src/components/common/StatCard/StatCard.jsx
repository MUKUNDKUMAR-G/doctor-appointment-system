import { memo } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown } from 'lucide-react';
import ModernCard from '../ModernCard';
import { colors } from '../../../theme/colors';

const StatCardContainer = styled(ModernCard)(({ theme, gradient }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  ...(gradient && {
    background: colors.gradients[gradient],
    color: '#ffffff',
    '& .MuiTypography-root': {
      color: '#ffffff',
    },
  }),
}));

const IconWrapper = styled(Box)(({ theme, color, gradient }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  backgroundColor: gradient
    ? 'rgba(255, 255, 255, 0.2)'
    : `${theme.palette[color]?.light || theme.palette.primary.light}20`,
  color: gradient
    ? '#ffffff'
    : theme.palette[color]?.main || theme.palette.primary.main,
  '& svg': {
    width: 24,
    height: 24,
  },
}));

const ValueWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
  marginBottom: '4px',
});

const TrendWrapper = styled(Box)(({ trend, gradient }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: gradient
    ? 'rgba(255, 255, 255, 0.2)'
    : trend > 0
    ? colors.success[50]
    : colors.error[50],
  color: gradient
    ? '#ffffff'
    : trend > 0
    ? colors.success.main
    : colors.error.main,
  '& svg': {
    width: 14,
    height: 14,
  },
}));

const StatCard = memo(({
  value,
  label,
  icon,
  color = 'primary',
  trend,
  animated = true,
  gradient,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 2,
  ...props
}) => {
  const isNumeric = typeof value === 'number';

  return (
    <StatCardContainer
      variant={gradient ? 'gradient' : 'elevated'}
      hover={false}
      gradient={gradient}
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <Box>
        {icon && (
          <IconWrapper color={color} gradient={gradient}>
            {icon}
          </IconWrapper>
        )}
        
        <ValueWrapper>
          <Typography
            variant="h3"
            component="div"
            sx={{
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {prefix}
            {animated && isNumeric ? (
              <CountUp
                end={value}
                duration={duration}
                decimals={decimals}
                separator=","
              />
            ) : (
              value
            )}
            {suffix}
          </Typography>
          
          {trend !== undefined && trend !== null && (
            <TrendWrapper trend={trend} gradient={gradient}>
              {trend > 0 ? (
                <TrendingUp />
              ) : (
                <TrendingDown />
              )}
              {Math.abs(trend)}%
            </TrendWrapper>
          )}
        </ValueWrapper>

        <Typography
          variant="body2"
          sx={{
            opacity: gradient ? 0.9 : 0.7,
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
      </Box>
    </StatCardContainer>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;
