/**
 * Accessibility utilities for keyboard navigation and screen reader support
 */

/**
 * Focus management utilities
 */
export const focusUtils = {
  /**
   * Trap focus within a container (useful for modals/dialogs)
   */
  trapFocus: (containerElement) => {
    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    containerElement.addEventListener('keydown', handleTabKey);
    return () => containerElement.removeEventListener('keydown', handleTabKey);
  },

  /**
   * Move focus to element
   */
  moveFocusTo: (element) => {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  },

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container) => {
    return container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  },
};

/**
 * Keyboard shortcuts configuration
 */
export const keyboardShortcuts = {
  DASHBOARD: { key: 'd', ctrlKey: true, altKey: true },
  FIND_DOCTORS: { key: 'f', ctrlKey: true, altKey: true },
  MY_APPOINTMENTS: { key: 'a', ctrlKey: true, altKey: true },
  PROFILE: { key: 'p', ctrlKey: true, altKey: true },
  BOOK_APPOINTMENT: { key: 'b', ctrlKey: true, altKey: true },
  SEARCH: { key: 's', ctrlKey: true },
  ESCAPE: { key: 'Escape' },
  ENTER: { key: 'Enter' },
  SPACE: { key: ' ' },
};

/**
 * Check if keyboard event matches shortcut
 */
export const matchesShortcut = (event, shortcut) => {
  return (
    event.key === shortcut.key &&
    (!shortcut.ctrlKey || event.ctrlKey) &&
    (!shortcut.altKey || event.altKey) &&
    (!shortcut.shiftKey || event.shiftKey)
  );
};

/**
 * ARIA live region announcer for screen readers
 */
class LiveRegionAnnouncer {
  constructor() {
    this.politeRegion = null;
    this.assertiveRegion = null;
    this.init();
  }

  init() {
    // Create polite live region
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('role', 'status');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.style.position = 'absolute';
    this.politeRegion.style.left = '-10000px';
    this.politeRegion.style.width = '1px';
    this.politeRegion.style.height = '1px';
    this.politeRegion.style.overflow = 'hidden';

    // Create assertive live region
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('role', 'alert');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.style.position = 'absolute';
    this.assertiveRegion.style.left = '-10000px';
    this.assertiveRegion.style.width = '1px';
    this.assertiveRegion.style.height = '1px';
    this.assertiveRegion.style.overflow = 'hidden';

    document.body.appendChild(this.politeRegion);
    document.body.appendChild(this.assertiveRegion);
  }

  announce(message, priority = 'polite') {
    const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;
    
    // Clear and set new message
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 100);
  }

  cleanup() {
    if (this.politeRegion) {
      document.body.removeChild(this.politeRegion);
    }
    if (this.assertiveRegion) {
      document.body.removeChild(this.assertiveRegion);
    }
  }
}

// Singleton instance
let announcerInstance = null;

export const getAnnouncer = () => {
  if (!announcerInstance) {
    announcerInstance = new LiveRegionAnnouncer();
  }
  return announcerInstance;
};

/**
 * Announce message to screen readers
 */
export const announce = (message, priority = 'polite') => {
  const announcer = getAnnouncer();
  announcer.announce(message, priority);
};

/**
 * Skip navigation link utilities
 */
export const skipNavigation = {
  /**
   * Create skip link element
   */
  createSkipLink: (targetId, text = 'Skip to main content') => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.className = 'skip-link';
    skipLink.textContent = text;
    skipLink.style.position = 'absolute';
    skipLink.style.top = '-40px';
    skipLink.style.left = '0';
    skipLink.style.background = '#2563EB';
    skipLink.style.color = 'white';
    skipLink.style.padding = '8px 16px';
    skipLink.style.textDecoration = 'none';
    skipLink.style.zIndex = '10000';
    skipLink.style.transition = 'top 0.2s';

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    return skipLink;
  },

  /**
   * Handle skip link click
   */
  handleSkipClick: (event, targetId) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.addEventListener('blur', () => {
        target.removeAttribute('tabindex');
      }, { once: true });
    }
  },
};

/**
 * Accessible form utilities
 */
export const formAccessibility = {
  /**
   * Associate error message with input
   */
  associateError: (inputId, errorId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.setAttribute('aria-describedby', errorId);
      input.setAttribute('aria-invalid', 'true');
    }
  },

  /**
   * Clear error association
   */
  clearError: (inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.removeAttribute('aria-describedby');
      input.setAttribute('aria-invalid', 'false');
    }
  },
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation duration based on user preference
 */
export const getAnimationDuration = (defaultDuration) => {
  return prefersReducedMotion() ? 0 : defaultDuration;
};

/**
 * Visually hidden class for screen reader only content
 */
export const visuallyHiddenStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};
