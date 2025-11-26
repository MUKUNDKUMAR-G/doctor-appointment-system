import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CollapsibleSection component provides collapsible sections for mobile layouts
 * Automatically collapses on mobile, expanded on desktop
 */
const CollapsibleSection = ({
  title,
  children,
  defaultExpanded = true,
  alwaysCollapsible = false,
  icon,
  elevation = 0,
  sx = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // On mobile, use controlled state; on desktop, always expanded unless alwaysCollapsible
  const shouldBeCollapsible = isMobile || alwaysCollapsible;
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (shouldBeCollapsible) {
      setExpanded(!expanded);
    }
  };

  const isExpanded = shouldBeCollapsible ? expanded : true;

  return (
    <Paper
      elevation={elevation}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          cursor: shouldBeCollapsible ? 'pointer' : 'default',
          backgroundColor: isExpanded ? 'transparent' : 'neutral.50',
          transition: 'background-color 0.2s ease',
          '&:hover': shouldBeCollapsible ? {
            backgroundColor: 'rgba(37, 99, 235, 0.02)',
          } : {},
        }}
        onClick={handleToggle}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                color: 'white',
              }}
            >
              {icon}
            </Box>
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            {title}
          </Typography>
        </Box>
        {shouldBeCollapsible && (
          <IconButton
            size="small"
            sx={{
              transition: 'transform 0.2s ease',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(0deg)',
            }}
          >
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}
      </Box>

      <Collapse in={isExpanded} timeout="auto">
        <Box sx={{ p: 2, pt: 0 }}>
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default CollapsibleSection;
