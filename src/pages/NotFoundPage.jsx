import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Box>
        <Typography variant="h1" component="h1" gutterBottom color="primary">
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Go Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;