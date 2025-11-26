import React, { useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  alpha,
} from '@mui/material';
import {
  Security,
  Notifications,
  History,
  ChevronRight,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import ModernCard from '../../common/ModernCard';
import AnimatedButton from '../../common/AnimatedButton';
import toast from 'react-hot-toast';

const SettingCard = ({ icon: Icon, title, description, onClick, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Box
        onClick={onClick}
        sx={{
          p: 2.5,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          cursor: 'pointer',
          transition: 'all 0.3s',
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
            borderColor: 'primary.main',
            transform: 'translateY(-4px)',
            boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 28 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
          <ChevronRight
            sx={{
              color: 'text.secondary',
              flexShrink: 0,
              transition: 'transform 0.2s',
              '.MuiBox-root:hover &': {
                transform: 'translateX(4px)',
              },
            }}
          />
        </Box>
      </Box>
    </motion.div>
  );
};

const AccountSettings = ({ onPasswordChange }) => {
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    appointmentReminders: true,
    appointmentConfirmations: true,
    marketingEmails: false,
  });

  const handlePasswordChange = async () => {
    try {
      setPasswordError(null);
      
      // Validation
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setPasswordError('All fields are required');
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }
      
      if (passwordData.newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters long');
        return;
      }
      
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordPattern.test(passwordData.newPassword)) {
        setPasswordError('Password must contain uppercase, lowercase, digit, and special character (@$!%*?&)');
        return;
      }
      
      setPasswordLoading(true);
      
      if (onPasswordChange) {
        await onPasswordChange({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        });
      }
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setSecurityDialogOpen(false);
      toast.success('Password updated successfully!');
      
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotificationSave = () => {
    // In real app, save to backend
    setNotificationsDialogOpen(false);
    toast.success('Notification preferences saved!');
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Mock activity data
  const activityData = [
    { activity: 'Profile Updated', date: new Date().toLocaleString(), status: 'Success' },
    { activity: 'Login', date: new Date(Date.now() - 3600000).toLocaleString(), status: 'Success' },
    { activity: 'Appointment Booked', date: new Date(Date.now() - 86400000).toLocaleString(), status: 'Completed' },
    { activity: 'Password Changed', date: new Date(Date.now() - 172800000).toLocaleString(), status: 'Success' },
  ];

  return (
    <>
      <ModernCard variant="elevated">
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Account Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage your account security and preferences
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            <SettingCard
              icon={Security}
              title="Security Settings"
              description="Change password & manage security"
              onClick={() => setSecurityDialogOpen(true)}
              delay={0.1}
            />
            <SettingCard
              icon={Notifications}
              title="Notifications"
              description="Manage notification preferences"
              onClick={() => setNotificationsDialogOpen(true)}
              delay={0.15}
            />
            <SettingCard
              icon={History}
              title="Activity History"
              description="View your account activity"
              onClick={() => setActivityDialogOpen(true)}
              delay={0.2}
            />
          </Box>
        </Box>
      </ModernCard>

      {/* Security Settings Dialog */}
      <Dialog
        open={securityDialogOpen}
        onClose={() => {
          setSecurityDialogOpen(false);
          setPasswordError(null);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Security Settings
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Change your password to keep your account secure.
          </Typography>
          
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Current Password"
            type={showPassword.current ? 'text' : 'password'}
            margin="normal"
            variant="outlined"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
            disabled={passwordLoading}
            InputProps={{
              endAdornment: (
                <Box
                  onClick={() => togglePasswordVisibility('current')}
                  sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword.current ? <VisibilityOff /> : <Visibility />}
                </Box>
              ),
            }}
          />
          <TextField
            fullWidth
            label="New Password"
            type={showPassword.new ? 'text' : 'password'}
            margin="normal"
            variant="outlined"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
            disabled={passwordLoading}
            helperText="Must be at least 8 characters with uppercase, lowercase, digit, and special character"
            InputProps={{
              endAdornment: (
                <Box
                  onClick={() => togglePasswordVisibility('new')}
                  sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword.new ? <VisibilityOff /> : <Visibility />}
                </Box>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type={showPassword.confirm ? 'text' : 'password'}
            margin="normal"
            variant="outlined"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            disabled={passwordLoading}
            InputProps={{
              endAdornment: (
                <Box
                  onClick={() => togglePasswordVisibility('confirm')}
                  sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                </Box>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <AnimatedButton
            onClick={() => {
              setSecurityDialogOpen(false);
              setPasswordError(null);
              setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }}
            disabled={passwordLoading}
            variant="outlined"
          >
            Cancel
          </AnimatedButton>
          <AnimatedButton
            onClick={handlePasswordChange}
            loading={passwordLoading}
            variant="contained"
            startIcon={<Lock />}
          >
            Update Password
          </AnimatedButton>
        </DialogActions>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog
        open={notificationsDialogOpen}
        onClose={() => setNotificationsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Notifications color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Notification Preferences
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage how you receive notifications about your appointments and account.
          </Typography>
          <List>
            {Object.entries(notificationSettings).map(([key, value]) => (
              <ListItem key={key} sx={{ px: 0 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={value}
                      onChange={(e) =>
                        setNotificationSettings(prev => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                    />
                  }
                  label={
                    key === 'emailNotifications'
                      ? 'Email Notifications'
                      : key === 'appointmentReminders'
                      ? 'Appointment Reminders'
                      : key === 'appointmentConfirmations'
                      ? 'Appointment Confirmations'
                      : 'Marketing Emails'
                  }
                  sx={{ width: '100%' }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <AnimatedButton
            onClick={() => setNotificationsDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </AnimatedButton>
          <AnimatedButton
            onClick={handleNotificationSave}
            variant="contained"
          >
            Save Preferences
          </AnimatedButton>
        </DialogActions>
      </Dialog>

      {/* Activity History Dialog */}
      <Dialog
        open={activityDialogOpen}
        onClose={() => setActivityDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <History color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Activity History
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Recent account activity and login history.
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Activity
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Date & Time
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Status
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activityData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.activity}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={
                          row.status === 'Success'
                            ? 'success'
                            : row.status === 'Completed'
                            ? 'info'
                            : 'default'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <AnimatedButton
            onClick={() => setActivityDialogOpen(false)}
            variant="contained"
          >
            Close
          </AnimatedButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountSettings;
