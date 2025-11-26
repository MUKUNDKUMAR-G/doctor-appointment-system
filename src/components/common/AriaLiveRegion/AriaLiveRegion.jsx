import React, { useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';

const LiveRegion = styled('div')({
  position: 'absolute',
  left: '-10000px',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
});

/**
 * ARIA Live Region component for screen reader announcements
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
const AriaLiveRegion = ({ message, priority = 'polite' }) => {
  const regionRef = useRef(null);

  useEffect(() => {
    if (message && regionRef.current) {
      // Clear and set new message with a small delay to ensure screen readers pick it up
      regionRef.current.textContent = '';
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  return (
    <LiveRegion
      ref={regionRef}
      role={priority === 'assertive' ? 'alert' : 'status'}
      aria-live={priority}
      aria-atomic="true"
    />
  );
};

export default AriaLiveRegion;
