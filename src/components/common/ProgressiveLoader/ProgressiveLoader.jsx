import { useState, useEffect } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Progressive loading indicator with smooth transitions
 * @param {boolean} loading - Whether to show the loader
 * @param {string} message - Optional loading message
 * @param {number} duration - Estimated duration in ms (for progress simulation)
 */
const ProgressiveLoader = ({ 
  loading = false, 
  message = 'Loading...', 
  duration = 2000,
  showProgress = true 
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading || !showProgress) {
      setProgress(0);
      return;
    }

    // Simulate progressive loading
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Cap at 90% until actual completion
        return prev + Math.random() * 10;
      });
    }, duration / 10);

    return () => clearInterval(interval);
  }, [loading, duration, showProgress]);

  // Complete progress when loading finishes
  useEffect(() => {
    if (!loading && progress > 0) {
      setProgress(100);
      setTimeout(() => setProgress(0), 500);
    }
  }, [loading, progress]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
            }}
          >
            {showProgress ? (
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 3,
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'primary.main',
                    transition: 'transform 0.4s ease',
                  },
                }}
              />
            ) : (
              <LinearProgress
                sx={{
                  height: 3,
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'primary.main',
                  },
                }}
              />
            )}
          </Box>

          {message && (
            <Box
              sx={{
                position: 'fixed',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10000,
                bgcolor: 'background.paper',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {message}
              </Typography>
            </Box>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProgressiveLoader;
