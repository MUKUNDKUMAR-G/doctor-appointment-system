import { createTheme } from '@mui/material/styles';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { animations } from './animations';

// Create MUI theme with custom configuration
export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: '#ffffff',
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
      dark: colors.success.dark,
      contrastText: '#ffffff',
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
      dark: colors.warning.dark,
      contrastText: '#ffffff',
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
      dark: colors.error.dark,
      contrastText: '#ffffff',
    },
    grey: colors.neutral,
    neutral: colors.neutral, // Add neutral palette for direct access
    background: {
      default: colors.neutral[50],
      paper: '#ffffff',
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[700],
      disabled: colors.neutral[400],
    },
  },
  typography: {
    fontFamily: typography.fontFamily,
    h1: typography.h1,
    h2: typography.h2,
    h3: typography.h3,
    h4: typography.h4,
    h5: typography.h5,
    h6: typography.h6,
    body1: typography.body1,
    body2: typography.body2,
    subtitle1: typography.subtitle1,
    subtitle2: typography.subtitle2,
    button: typography.button,
    caption: typography.caption,
    overline: typography.overline,
  },
  spacing: 8, // Base spacing unit
  shape: {
    borderRadius: 12, // Modern rounded corners
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.08)',
    '0px 8px 16px rgba(0, 0, 0, 0.1)',
    '0px 12px 24px rgba(0, 0, 0, 0.12)',
    '0px 16px 32px rgba(0, 0, 0, 0.14)',
    '0px 20px 40px rgba(0, 0, 0, 0.16)',
    '0px 24px 48px rgba(0, 0, 0, 0.18)',
    '0px 28px 56px rgba(0, 0, 0, 0.2)',
    '0px 32px 64px rgba(0, 0, 0, 0.22)',
    '0px 36px 72px rgba(0, 0, 0, 0.24)',
    '0px 40px 80px rgba(0, 0, 0, 0.26)',
    '0px 44px 88px rgba(0, 0, 0, 0.28)',
    '0px 48px 96px rgba(0, 0, 0, 0.3)',
    '0px 52px 104px rgba(0, 0, 0, 0.32)',
    '0px 56px 112px rgba(0, 0, 0, 0.34)',
    '0px 60px 120px rgba(0, 0, 0, 0.36)',
    '0px 64px 128px rgba(0, 0, 0, 0.38)',
    '0px 68px 136px rgba(0, 0, 0, 0.4)',
    '0px 72px 144px rgba(0, 0, 0, 0.42)',
    '0px 76px 152px rgba(0, 0, 0, 0.44)',
    '0px 80px 160px rgba(0, 0, 0, 0.46)',
    '0px 84px 168px rgba(0, 0, 0, 0.48)',
    '0px 88px 176px rgba(0, 0, 0, 0.5)',
    '0px 92px 184px rgba(0, 0, 0, 0.52)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.15)',
          },
          '&:focus-visible': {
            outline: `3px solid ${colors.primary.light}`,
            outlineOffset: '2px',
          },
        },
        contained: {
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `3px solid ${colors.primary.light}`,
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `3px solid ${colors.primary.light}`,
            outlineOffset: '2px',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
          transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused': {
              outline: `2px solid ${colors.primary.light}`,
              outlineOffset: '2px',
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `3px solid ${colors.primary.light}`,
            outlineOffset: '2px',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `2px solid ${colors.primary.light}`,
            outlineOffset: '-2px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

// Export all theme utilities
export { colors, typography, spacing, animations };
export * from './animations'; // Export animation variants
