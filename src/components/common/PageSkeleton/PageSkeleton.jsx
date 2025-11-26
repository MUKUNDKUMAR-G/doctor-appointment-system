import { Box, Container, Skeleton } from '@mui/material';

/**
 * Generic page skeleton loader
 */
const PageSkeleton = ({ children }) => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {children}
    </Container>
  );
};

export default PageSkeleton;
