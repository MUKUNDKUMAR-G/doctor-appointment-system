import { useState } from 'react';
import { Box, Tabs, Tab, Badge } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EventAvailable, 
  History, 
  EventBusy 
} from '@mui/icons-material';

const AppointmentTabs = ({ 
  activeTab, 
  onTabChange, 
  counts = { upcoming: 0, past: 0, cancelled: 0 },
  children 
}) => {
  const tabs = [
    { 
      label: 'Upcoming', 
      value: 0, 
      icon: EventAvailable,
      count: counts.upcoming 
    },
    { 
      label: 'Past', 
      value: 1, 
      icon: History,
      count: counts.past 
    },
    { 
      label: 'Cancelled', 
      value: 2, 
      icon: EventBusy,
      count: counts.cancelled 
    },
  ];

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => onTabChange(newValue)}
        sx={{
          mb: 3,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
          },
          '& .MuiTab-root': {
            minHeight: 64,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            '&:hover': {
              color: 'primary.main',
              backgroundColor: 'rgba(37, 99, 235, 0.04)',
            },
            '&.Mui-selected': {
              color: 'primary.main',
              fontWeight: 600,
            },
          },
        }}
      >
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <IconComponent sx={{ fontSize: 20 }} />
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge 
                      badgeContent={tab.count} 
                      color={tab.value === 0 ? 'primary' : tab.value === 1 ? 'secondary' : 'error'}
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.75rem',
                          height: 20,
                          minWidth: 20,
                          borderRadius: '10px',
                        },
                      }}
                    />
                  )}
                </Box>
              }
            />
          );
        })}
      </Tabs>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab > (tabs.findIndex(t => t.value === activeTab) - 1) ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab > (tabs.findIndex(t => t.value === activeTab) - 1) ? -20 : 20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default AppointmentTabs;
