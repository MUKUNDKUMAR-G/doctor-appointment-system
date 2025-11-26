import React, { memo } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import ModernCard from '../../common/ModernCard';
import { colors } from '../../../theme/colors';

const ChartContainer = styled(ModernCard)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
}));

const ChartHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const CHART_COLORS = [
  colors.primary.main,
  colors.secondary.main,
  colors.success.main,
  colors.warning.main,
  colors.error.main,
  colors.primary[500],
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: 2,
          border: `1px solid ${colors.grey[200]}`,
          borderRadius: 1,
          boxShadow: 3,
        }}
      >
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: entry.color }}
          >
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const AnalyticsChartPanel = memo(({
  title,
  subtitle,
  chartType = 'line',
  data = [],
  dataKeys = [],
  xAxisKey = 'name',
  colors: customColors,
  height = 300,
  showLegend = true,
  showGrid = true,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const chartColors = customColors || CHART_COLORS;

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: isMobile ? 5 : 30, left: isMobile ? 0 : 20, bottom: 5 },
    };

    const axisProps = {
      stroke: colors.grey[400],
      style: { fontSize: isMobile ? '10px' : '12px' },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={colors.grey[200]} />}
            <XAxis dataKey={xAxisKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} />}
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartColors[index % chartColors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={colors.grey[200]} />}
            <XAxis dataKey={xAxisKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} />}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={chartColors[index % chartColors.length]}
                radius={[8, 8, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={colors.grey[200]} />}
            <XAxis dataKey={xAxisKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} />}
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartColors[index % chartColors.length]}
                fill={chartColors[index % chartColors.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={!isMobile}
              label={!isMobile}
              outerRadius={isMobile ? 60 : 80}
              fill="#8884d8"
              dataKey={dataKeys[0] || 'value'}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <ChartContainer variant="elevated" {...props}>
      {(title || subtitle) && (
        <ChartHeader>
          {title && (
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </ChartHeader>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </ChartContainer>
  );
});

AnalyticsChartPanel.displayName = 'AnalyticsChartPanel';

export default AnalyticsChartPanel;
