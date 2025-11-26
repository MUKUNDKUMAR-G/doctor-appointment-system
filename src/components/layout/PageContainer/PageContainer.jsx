import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * PageContainer component provides consistent responsive layout for all pages
 * with animations and proper spacing
 */
const PageContainer = ({
  children,
  maxWidth = 'lg',
  disableGutters = false,
  animate = true,
  sx = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  const content = (
    <Container
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3 },
        ...sx,
      }}
    >
      {children}
    </Container>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {content}
    </motion.div>
  );
};

export default PageContainer;
