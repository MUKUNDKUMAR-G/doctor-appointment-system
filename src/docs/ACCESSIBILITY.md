# Accessibility Features

This document outlines the accessibility features implemented in the Healthcare Appointment System to ensure WCAG 2.1 AA compliance.

## Keyboard Navigation

### Global Keyboard Shortcuts

The application supports the following keyboard shortcuts for quick navigation:

- **Ctrl+Alt+D**: Navigate to Dashboard
- **Ctrl+Alt+F**: Navigate to Find Doctors
- **Ctrl+Alt+A**: Navigate to My Appointments
- **Ctrl+Alt+P**: Navigate to Profile
- **Ctrl+Alt+B**: Navigate to Book Appointment
- **Ctrl+S**: Focus search input (where applicable)
- **Escape**: Close modals and dialogs

### Focus Management

- All interactive elements are keyboard accessible
- Visible focus indicators (3px blue outline) on all focusable elements
- Logical tab order throughout the application
- Focus trap implemented for modals and dialogs
- Skip navigation link to jump to main content

### Implementation

```javascript
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

// In your component
useKeyboardNavigation();
```

## Screen Reader Support

### Semantic HTML

- Proper use of semantic HTML elements (`<main>`, `<nav>`, `<header>`, `<section>`, etc.)
- All pages have a `<main>` element with `id="main-content"`
- Headings follow a logical hierarchy (h1 → h2 → h3)

### ARIA Labels

- All interactive elements have descriptive ARIA labels
- Navigation items indicate current page with `aria-current="page"`
- Buttons have `aria-label` or `aria-describedby` attributes
- Loading states use `aria-busy="true"`
- Form inputs have associated labels

### Live Regions

ARIA live regions announce dynamic content changes to screen readers:

```javascript
import { announce } from '../utils/accessibility';

// Announce a message
announce('Appointment booked successfully', 'polite');

// Urgent announcement
announce('Error: Please try again', 'assertive');
```

### Skip Navigation

A skip navigation link allows keyboard users to bypass repetitive navigation:

```jsx
<SkipNavigation targetId="main-content" text="Skip to main content" />
```

## Visual Accessibility

### Color Contrast

All text and UI components meet WCAG 2.1 AA standards:

- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

### Non-Color Indicators

Information is not conveyed by color alone:

- Status indicators use both color and icons
- Trends show arrows in addition to color
- Form validation uses icons and text
- Focus indicators are visible outlines

### Focus Indicators

- All interactive elements have visible focus indicators
- 3px blue outline with 2px offset
- Consistent across all components
- High contrast for visibility

## Motion Preferences

### Reduced Motion Support

The application respects the user's motion preferences:

```javascript
import { useReducedMotion } from '../hooks/useReducedMotion';

const prefersReducedMotion = useReducedMotion();

// Conditionally apply animations
const duration = prefersReducedMotion ? 0 : 300;
```

### Motion Context

Use the Motion Context for automatic reduced motion support:

```javascript
import { useMotion } from '../contexts/MotionContext';

const { prefersReducedMotion, getAnimationProps, getDuration } = useMotion();

// Get animation props with reduced motion support
const animationProps = getAnimationProps({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
});
```

### CSS Media Query

Global CSS respects motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing Accessibility

### Automated Testing

Run accessibility tests using axe-core:

```bash
npm run test:a11y
```

### Manual Testing

1. **Keyboard Navigation**: Navigate the entire app using only the keyboard
2. **Screen Reader**: Test with NVDA (Windows), JAWS (Windows), or VoiceOver (Mac)
3. **Color Contrast**: Use browser DevTools or online contrast checkers
4. **Reduced Motion**: Enable "Reduce motion" in OS settings and test animations

### Browser Testing

Test accessibility features in:
- Chrome with ChromeVox
- Firefox with NVDA
- Safari with VoiceOver
- Edge with Narrator

## Utilities

### Accessibility Utilities

```javascript
import {
  focusUtils,
  announce,
  skipNavigation,
  formAccessibility,
  prefersReducedMotion,
  visuallyHiddenStyles,
} from '../utils/accessibility';

// Trap focus in a modal
const cleanup = focusUtils.trapFocus(modalElement);

// Announce to screen readers
announce('Form submitted successfully');

// Check motion preference
if (prefersReducedMotion()) {
  // Disable animations
}

// Apply visually hidden styles
<span style={visuallyHiddenStyles}>Screen reader only text</span>
```

### Color Contrast Utilities

```javascript
import { checkTextContrast, getAccessibleTextColor } from '../utils/colorContrast';

// Check contrast ratio
const result = checkTextContrast('#333333', '#ffffff');
console.log(result); // { passes: true, ratio: '12.63', required: 4.5 }

// Get accessible text color for background
const textColor = getAccessibleTextColor('#2563EB'); // Returns '#ffffff'
```

## Best Practices

1. **Always provide text alternatives** for images and icons
2. **Use semantic HTML** whenever possible
3. **Test with keyboard only** before releasing features
4. **Provide clear focus indicators** for all interactive elements
5. **Announce dynamic content changes** to screen readers
6. **Respect user preferences** for motion and contrast
7. **Maintain logical heading hierarchy** on all pages
8. **Ensure sufficient color contrast** for all text
9. **Provide skip links** for repetitive navigation
10. **Test with actual assistive technologies**

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
