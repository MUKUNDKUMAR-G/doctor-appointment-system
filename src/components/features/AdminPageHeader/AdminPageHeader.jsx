import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { colors } from '../../../theme/colors';

const HeaderContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2, 0),
}));

const TitleRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.95rem',
  marginBottom: theme.spacing(2),
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
}));

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  '& .MuiBreadcrumbs-separator': {
    color: theme.palette.text.secondary,
  },
}));

const BreadcrumbLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  fontSize: '0.875rem',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: colors.primary.main,
    textDecoration: 'none',
  },
}));

const CurrentBreadcrumb = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: theme.palette.text.primary,
  fontSize: '0.875rem',
  fontWeight: 500,
}));

/**
 * AdminPageHeader - Consistent header component for admin pages
 * 
 * @param {string} title - Page title
 * @param {string} subtitle - Optional subtitle/description
 * @param {Array} breadcrumbs - Array of breadcrumb objects with { label, path, icon }
 * @param {ReactNode} actions - Action buttons or components to display in header
 */
const AdminPageHeader = ({ title, subtitle, breadcrumbs = [], actions }) => {
  return (
    <HeaderContainer>
      {breadcrumbs.length > 0 && (
        <StyledBreadcrumbs
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <BreadcrumbLink
            component={RouterLink}
            to="/admin-dashboard"
            underline="hover"
          >
            <Home fontSize="small" />
            Dashboard
          </BreadcrumbLink>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const Icon = crumb.icon;
            
            if (isLast) {
              return (
                <CurrentBreadcrumb key={crumb.label}>
                  {Icon && <Icon fontSize="small" />}
                  {crumb.label}
                </CurrentBreadcrumb>
              );
            }
            
            return (
              <BreadcrumbLink
                key={crumb.label}
                component={RouterLink}
                to={crumb.path}
                underline="hover"
              >
                {Icon && <Icon fontSize="small" />}
                {crumb.label}
              </BreadcrumbLink>
            );
          })}
        </StyledBreadcrumbs>
      )}
      
      <TitleRow>
        <Box>
          <Title variant="h1">{title}</Title>
          {subtitle && <Subtitle variant="body1">{subtitle}</Subtitle>}
        </Box>
        {actions && <ActionsContainer>{actions}</ActionsContainer>}
      </TitleRow>
    </HeaderContainer>
  );
};

export default AdminPageHeader;
