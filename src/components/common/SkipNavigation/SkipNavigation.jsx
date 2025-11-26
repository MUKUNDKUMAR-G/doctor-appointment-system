import React from 'react';
import { styled } from '@mui/material/styles';
import { colors } from '../../../theme/colors';

const SkipLink = styled('a')(({ theme }) => ({
  position: 'absolute',
  top: '-40px',
  left: 0,
  background: colors.primary.main,
  color: '#ffffff',
  padding: theme.spacing(1, 2),
  textDecoration: 'none',
  zIndex: 10000,
  transition: 'top 0.2s ease',
  fontWeight: 600,
  borderRadius: '0 0 8px 0',
  
  '&:focus': {
    top: 0,
    outline: `3px solid ${colors.primary.light}`,
    outlineOffset: '2px',
  },
}));

/**
 * Skip Navigation component for accessibility
 * Allows keyboard users to skip to main content
 */
const SkipNavigation = ({ targetId = 'main-content', text = 'Skip to main content' }) => {
  const handleClick = (event) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.addEventListener('blur', () => {
        target.removeAttribute('tabindex');
      }, { once: true });
    }
  };

  return (
    <SkipLink href={`#${targetId}`} onClick={handleClick}>
      {text}
    </SkipLink>
  );
};

export default SkipNavigation;
