/**
 * Color contrast utilities for WCAG 2.1 AA compliance
 */

/**
 * Convert hex color to RGB
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Calculate relative luminance
 */
const getLuminance = (r, g, b) => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - Hex color
 * @param {string} color2 - Hex color
 * @returns {number} Contrast ratio
 */
export const getContrastRatio = (color1, color2) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if contrast ratio meets WCAG AA standards
 * @param {number} ratio - Contrast ratio
 * @param {string} level - 'AA' or 'AAA'
 * @param {string} size - 'normal' or 'large'
 * @returns {boolean}
 */
export const meetsWCAG = (ratio, level = 'AA', size = 'normal') => {
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
  // AA level
  return size === 'large' ? ratio >= 3 : ratio >= 4.5;
};

/**
 * Check if text color has sufficient contrast with background
 * @param {string} textColor - Hex color
 * @param {string} bgColor - Hex color
 * @param {string} size - 'normal' or 'large'
 * @returns {object} { passes: boolean, ratio: number }
 */
export const checkTextContrast = (textColor, bgColor, size = 'normal') => {
  const ratio = getContrastRatio(textColor, bgColor);
  const passes = meetsWCAG(ratio, 'AA', size);
  
  return {
    passes,
    ratio: ratio.toFixed(2),
    required: size === 'large' ? 3 : 4.5,
  };
};

/**
 * Verify theme colors meet WCAG standards
 */
export const verifyThemeContrast = (colors) => {
  const results = [];

  // Check primary text on white background
  results.push({
    name: 'Primary text on white',
    ...checkTextContrast(colors.neutral[900], '#ffffff'),
  });

  // Check secondary text on white background
  results.push({
    name: 'Secondary text on white',
    ...checkTextContrast(colors.neutral[700], '#ffffff'),
  });

  // Check primary button text
  results.push({
    name: 'Primary button text',
    ...checkTextContrast('#ffffff', colors.primary.main),
  });

  // Check success button text
  results.push({
    name: 'Success button text',
    ...checkTextContrast('#ffffff', colors.success.main),
  });

  // Check error button text
  results.push({
    name: 'Error button text',
    ...checkTextContrast('#ffffff', colors.error.main),
  });

  // Check warning button text
  results.push({
    name: 'Warning button text',
    ...checkTextContrast('#ffffff', colors.warning.main),
  });

  return results;
};

/**
 * Get accessible color for text based on background
 * @param {string} bgColor - Background hex color
 * @returns {string} '#000000' or '#ffffff'
 */
export const getAccessibleTextColor = (bgColor) => {
  const rgb = hexToRgb(bgColor);
  if (!rgb) return '#000000';

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.5 ? '#000000' : '#ffffff';
};
