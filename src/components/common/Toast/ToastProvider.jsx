import React from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { styled } from '@mui/material/styles';
import { colors } from '../../../theme/colors';
import { animations } from '../../../theme/animations';

const StyledToaster = styled(Toaster)(({ theme }) => ({
  '& > div': {
    // Custom toast container styles
  },
}));

// Custom hook to use toast notifications
export const useToast = () => {
  const showToast = (message, type = 'success') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'loading':
        toast.loading(message);
        break;
      case 'warning':
        toast(message, {
          icon: '⚠️',
          style: {
            background: colors.warning[50],
            color: colors.warning.dark,
            border: `1px solid ${colors.warning[200]}`,
          },
        });
        break;
      default:
        toast(message);
    }
  };

  return { showToast, toast };
};

const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <StyledToaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 5000,
          style: {
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
            maxWidth: '400px',
          },
          success: {
            style: {
              background: colors.success[50],
              color: colors.success.dark,
              border: `1px solid ${colors.success[200]}`,
            },
            iconTheme: {
              primary: colors.success.main,
              secondary: '#ffffff',
            },
          },
          error: {
            style: {
              background: colors.error[50],
              color: colors.error.dark,
              border: `1px solid ${colors.error[200]}`,
            },
            iconTheme: {
              primary: colors.error.main,
              secondary: '#ffffff',
            },
          },
          loading: {
            style: {
              background: colors.primary[50],
              color: colors.primary.dark,
              border: `1px solid ${colors.primary[200]}`,
            },
            iconTheme: {
              primary: colors.primary.main,
              secondary: '#ffffff',
            },
          },
        }}
      />
    </>
  );
};

export default ToastProvider;
