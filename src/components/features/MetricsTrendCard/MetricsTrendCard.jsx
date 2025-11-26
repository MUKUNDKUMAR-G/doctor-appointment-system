import React, { memo } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import ModernCard from '../../common/ModernCard';
import { colors } from '../../../theme/colors';

const TrendCardContainer = styled(ModernCard)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const MetricHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

const IconWrapper = styled(Box)(({ theme, color }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `${theme.palette[color]?.light || theme.palette.primary.light}20`,
  color: theme.palette[color]?.main || theme.palette.primary.main,
  '& svg': {
    width: 20,
    height: 20,
  },
}));

const TrendBadge = styled(Box)(({ trend }) => {
  const getTrendColor = () => {
    if (trend > 0) return { bg: colors.success[50], color: colors.success.main };
    if (trend < 0) return { bg: colors.error[50], color: colors.error.main };
    return { bg: colors.grey[100], color: colors.grey[600] };
  };

  const trendColors = getTrendColor();

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '0.875rem',
    fontWeight: 600,
    backgroundColor: trendColors.bg,
    color: trendColors.color,
    '& svg': {
      width: 16,
      height: 16,
    },
  };
});

const ValueWrapper = styled(Box)({
  marginBottom: '8px',
});

const PeriodText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(1),
}));

const MetricsTrendCard = memo(({
  metric,
  value,
  trend,
  period = 'vs last period',
  icon,
  color = 'primary',
  animated = true,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 2,
  ...props
}) => {
  const isNumeric = typeof value === 'number';
  const trendValue = typeof trend === 'number' ? trend : 0;

  const getTrendIcon = () => {
    if (trendValue > 0) return <TrendingUp />;
    if (trendValue < 0) return <TrendingDown />;
    return <Minus />;
  };

  const getTrendText = () => {
    if (trendValue === 0) return 'No change';
    const absValue = Math.abs(trendValue);
    return `${trendValue > 0 ? '+' : ''}${absValue}%`;
  };

  return (
    <TrendCardContainer
      variant="elevated"
      hover={false}
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <Box>
        <MetricHeader>
          {icon && <IconWrapper color={color}>{icon}</IconWrapper>}
          {trend !== undefined && trend !== null && (
            <TrendBadge trend={trendValue}>
              {getTrendIcon()}
              {getTrendText()}
            </TrendBadge>
          )}
        </MetricHeader>

        <ValueWrapper>
          <Typography
            variant="h3"
            component="div"
            sx={{
              fontWeight: 700,
              lineHeight: 1,
              color: 'text.primary',
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
        </ValueWrapper>

        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            marginBottom: 0.5,
          }}
        >
          {metric}
        </Typography>

        <PeriodText>{period}</PeriodText>
      </Box>
    </TrendCardContainer>
  );
});

MetricsTrendCard.displayName = 'MetricsTrendCard';

export default MetricsTrendCard;
