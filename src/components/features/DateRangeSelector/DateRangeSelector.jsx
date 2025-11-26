import React, { memo, useState } from 'react';
import { Box, Button, ButtonGroup, TextField, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Calendar } from 'lucide-react';
import ModernCard from '../../common/ModernCard';

const SelectorContainer = styled(ModernCard)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

const QuickSelectGroup = styled(ButtonGroup)(({ theme }) => ({
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  '& .MuiButton-root': {
    textTransform: 'none',
    fontWeight: 500,
  },
}));

const DateInputsWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  flexDirection: 'column',
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}));

const QUICK_RANGES = [
  { label: 'Today', days: 0 },
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: '1 Year', days: 365 },
];

const DateRangeSelector = memo(({
  startDate,
  endDate,
  onDateRangeChange,
  showQuickSelect = true,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedRange, setSelectedRange] = useState(null);

  const handleQuickSelect = (days) => {
    const end = new Date();
    const start = new Date();
    
    if (days === 0) {
      // Today
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setDate(end.getDate() - days);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    setSelectedRange(days);
    onDateRangeChange({ start, end });
  };

  const handleStartDateChange = (date) => {
    setSelectedRange(null);
    onDateRangeChange({ start: date, end: endDate });
  };

  const handleEndDateChange = (date) => {
    setSelectedRange(null);
    onDateRangeChange({ start: startDate, end: date });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <SelectorContainer variant="outlined" {...props}>
        {showQuickSelect && (
          <QuickSelectGroup
            size={isMobile ? 'small' : 'medium'}
            variant="outlined"
            aria-label="quick date range selection"
          >
            {QUICK_RANGES.map((range) => (
              <Button
                key={range.days}
                onClick={() => handleQuickSelect(range.days)}
                variant={selectedRange === range.days ? 'contained' : 'outlined'}
              >
                {range.label}
              </Button>
            ))}
          </QuickSelectGroup>
        )}

        <DateInputsWrapper>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={handleStartDateChange}
            maxDate={endDate || new Date()}
            slotProps={{
              textField: {
                size: isMobile ? 'small' : 'medium',
                fullWidth: isMobile,
              },
            }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={handleEndDateChange}
            minDate={startDate}
            maxDate={new Date()}
            slotProps={{
              textField: {
                size: isMobile ? 'small' : 'medium',
                fullWidth: isMobile,
              },
            }}
          />
        </DateInputsWrapper>
      </SelectorContainer>
    </LocalizationProvider>
  );
});

DateRangeSelector.displayName = 'DateRangeSelector';

export default DateRangeSelector;
