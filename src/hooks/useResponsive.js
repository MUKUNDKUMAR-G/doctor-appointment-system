import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Custom hook for responsive breakpoints
 * Provides easy access to common breakpoint queries
 */
export const useResponsive = () => {
  const theme = useTheme();

  return {
    isMobile: useMediaQuery(theme.breakpoints.down('sm')),
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'md')),
    isDesktop: useMediaQuery(theme.breakpoints.up('md')),
    isLargeDesktop: useMediaQuery(theme.breakpoints.up('lg')),
    isExtraLarge: useMediaQuery(theme.breakpoints.up('xl')),
    
    // Specific breakpoint checks
    isXs: useMediaQuery(theme.breakpoints.only('xs')),
    isSm: useMediaQuery(theme.breakpoints.only('sm')),
    isMd: useMediaQuery(theme.breakpoints.only('md')),
    isLg: useMediaQuery(theme.breakpoints.only('lg')),
    isXl: useMediaQuery(theme.breakpoints.only('xl')),
    
    // Orientation
    isPortrait: useMediaQuery('(orientation: portrait)'),
    isLandscape: useMediaQuery('(orientation: landscape)'),
    
    // Touch device detection
    isTouchDevice: useMediaQuery('(hover: none) and (pointer: coarse)'),
  };
};

export default useResponsive;
