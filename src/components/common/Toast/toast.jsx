import toast from 'react-hot-toast';
import {
  CheckCircle,
  Error as XCircle,
  Warning as AlertCircle,
  Info,
  HourglassEmpty as Loader,
} from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const ToastContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const IconWrapper = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '& svg': {
    width: 20,
    height: 20,
  },
});

const MessageWrapper = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const createToast = (type, message, options = {}) => {
  const icons = {
    success: <CheckCircle />,
    error: <XCircle />,
    warning: <AlertCircle />,
    info: <Info />,
    loading: <Loader />,
  };

  const content = (
    <ToastContent>
      <IconWrapper>{icons[type]}</IconWrapper>
      <MessageWrapper>
        {typeof message === 'string' ? (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {message}
          </Typography>
        ) : (
          message
        )}
      </MessageWrapper>
    </ToastContent>
  );

  return toast[type](content, {
    ...options,
    style: {
      ...options.style,
    },
  });
};

// Exported toast functions
export const showToast = {
  success: (message, options) => createToast('success', message, options),
  error: (message, options) => createToast('error', message, options),
  warning: (message, options) => {
    return toast(() => (
      <ToastContent>
        <IconWrapper>
          <AlertCircle />
        </IconWrapper>
        <MessageWrapper>
          {typeof message === 'string' ? (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {message}
            </Typography>
          ) : (
            message
          )}
        </MessageWrapper>
      </ToastContent>
    ), {
      duration: 5000,
      style: {
        background: '#FFFBEB',
        color: '#92400E',
        border: '1px solid #FDE68A',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
        maxWidth: '400px',
      },
      ...options,
    });
  },
  info: (message, options) => {
    return toast(() => (
      <ToastContent>
        <IconWrapper>
          <Info />
        </IconWrapper>
        <MessageWrapper>
          {typeof message === 'string' ? (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {message}
            </Typography>
          ) : (
            message
          )}
        </MessageWrapper>
      </ToastContent>
    ), {
      duration: 5000,
      style: {
        background: '#EFF6FF',
        color: '#1E40AF',
        border: '1px solid #BFDBFE',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
        maxWidth: '400px',
      },
      ...options,
    });
  },
  loading: (message, options) => createToast('loading', message, options),
  promise: (promise, messages, options) => {
    return toast.promise(
      promise,
      {
        loading: (
          <ToastContent>
            <IconWrapper>
              <Loader />
            </IconWrapper>
            <MessageWrapper>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {messages.loading}
              </Typography>
            </MessageWrapper>
          </ToastContent>
        ),
        success: (data) => (
          <ToastContent>
            <IconWrapper>
              <CheckCircle />
            </IconWrapper>
            <MessageWrapper>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {typeof messages.success === 'function'
                  ? messages.success(data)
                  : messages.success}
              </Typography>
            </MessageWrapper>
          </ToastContent>
        ),
        error: (err) => (
          <ToastContent>
            <IconWrapper>
              <XCircle />
            </IconWrapper>
            <MessageWrapper>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {typeof messages.error === 'function'
                  ? messages.error(err)
                  : messages.error}
              </Typography>
            </MessageWrapper>
          </ToastContent>
        ),
      },
      options
    );
  },
  // Admin-specific notification with severity levels
  admin: (message, severity = 'info', options = {}) => {
    const severityConfig = {
      info: {
        icon: <Info />,
        background: '#EFF6FF',
        color: '#1E40AF',
        border: '1px solid #BFDBFE',
        duration: 5000,
      },
      success: {
        icon: <CheckCircle />,
        background: '#F0FDF4',
        color: '#166534',
        border: '1px solid #BBF7D0',
        duration: 5000,
      },
      warning: {
        icon: <AlertCircle />,
        background: '#FFFBEB',
        color: '#92400E',
        border: '1px solid #FDE68A',
        duration: 7000,
      },
      error: {
        icon: <XCircle />,
        background: '#FEF2F2',
        color: '#991B1B',
        border: '1px solid #FECACA',
        duration: 8000,
      },
      critical: {
        icon: <XCircle />,
        background: '#7F1D1D',
        color: '#FFFFFF',
        border: '2px solid #991B1B',
        duration: 10000,
      },
    };

    const config = severityConfig[severity] || severityConfig.info;

    return toast(() => (
      <ToastContent>
        <IconWrapper>{config.icon}</IconWrapper>
        <MessageWrapper>
          {typeof message === 'string' ? (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {message}
            </Typography>
          ) : (
            message
          )}
        </MessageWrapper>
      </ToastContent>
    ), {
      duration: config.duration,
      style: {
        background: config.background,
        color: config.color,
        border: config.border,
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
        maxWidth: '400px',
      },
      ...options,
    });
  },
  dismiss: (toastId) => toast.dismiss(toastId),
  remove: (toastId) => toast.remove(toastId),
};

export default showToast;
