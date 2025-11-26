import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { keyboardShortcuts, matchesShortcut } from '../utils/accessibility';

/**
 * Custom hook for keyboard navigation shortcuts
 */
export const useKeyboardNavigation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Dashboard shortcut (Ctrl+Alt+D)
      if (matchesShortcut(event, keyboardShortcuts.DASHBOARD)) {
        event.preventDefault();
        navigate('/dashboard');
      }
      
      // Find Doctors shortcut (Ctrl+Alt+F)
      if (matchesShortcut(event, keyboardShortcuts.FIND_DOCTORS)) {
        event.preventDefault();
        navigate('/find-doctors');
      }
      
      // My Appointments shortcut (Ctrl+Alt+A)
      if (matchesShortcut(event, keyboardShortcuts.MY_APPOINTMENTS)) {
        event.preventDefault();
        navigate('/my-appointments');
      }
      
      // Profile shortcut (Ctrl+Alt+P)
      if (matchesShortcut(event, keyboardShortcuts.PROFILE)) {
        event.preventDefault();
        navigate('/profile');
      }
      
      // Book Appointment shortcut (Ctrl+Alt+B)
      if (matchesShortcut(event, keyboardShortcuts.BOOK_APPOINTMENT)) {
        event.preventDefault();
        navigate('/appointments/book');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
};

/**
 * Custom hook for focus trap (useful for modals)
 */
export const useFocusTrap = (containerRef, isActive = true) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element on mount
    if (firstElement) {
      firstElement.focus();
    }

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [containerRef, isActive]);
};

/**
 * Custom hook for escape key handler
 */
export const useEscapeKey = (callback, isActive = true) => {
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (event) => {
      if (matchesShortcut(event, keyboardShortcuts.ESCAPE)) {
        callback();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [callback, isActive]);
};
