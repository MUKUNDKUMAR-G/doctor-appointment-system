import { Box } from '@mui/material';
import Header from './layout/Header';
import MobileNav from './layout/MobileNav';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          backgroundColor: 'neutral.50',
          pb: { xs: 10, md: 3 }, // Extra padding for mobile bottom nav
        }}
      >
        {children}
      </Box>
      <MobileNav />
    </Box>
  );
};

export default Layout;