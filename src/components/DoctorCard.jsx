import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
  Rating,
  Divider,
} from '@mui/material';
import {
  Person,
  School,
  Work,
  Schedule,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/doctors/${doctor.id}`);
  };

  const handleBookAppointment = () => {
    navigate(`/doctors/${doctor.id}/book`);
  };

  // Generate initials for avatar if no image
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Mock rating for display (would come from backend in real implementation)
  const mockRating = 4.2 + (doctor.id % 10) * 0.1;
  const mockReviewCount = 15 + (doctor.id % 20);

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Doctor Header */}
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            sx={{ 
              width: 60, 
              height: 60, 
              mr: 2,
              bgcolor: 'primary.main',
              fontSize: '1.2rem',
            }}
          >
            {doctor.profileImage ? (
              <img 
                src={doctor.profileImage} 
                alt={`Dr. ${doctor.user.firstName} ${doctor.user.lastName}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              getInitials(doctor.user.firstName, doctor.user.lastName)
            )}
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="h6" component="h3" noWrap>
              Dr. {doctor.user.firstName} {doctor.user.lastName}
            </Typography>
            <Chip 
              label={doctor.specialty} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Rating */}
        <Box display="flex" alignItems="center" mb={2}>
          <Rating 
            value={mockRating} 
            precision={0.1} 
            readOnly 
            size="small"
          />
          <Typography variant="body2" color="text.secondary" ml={1}>
            {mockRating.toFixed(1)} ({mockReviewCount} reviews)
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Doctor Details */}
        <Box mb={2}>
          <Box display="flex" alignItems="center" mb={1}>
            <School fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {doctor.qualifications}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" mb={1}>
            <Work fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {doctor.experienceYears} years experience
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            <Schedule fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Available today
            </Typography>
          </Box>
        </Box>

        {/* Bio Preview */}
        {doctor.bio && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {doctor.bio}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          size="small" 
          onClick={handleViewProfile}
          sx={{ mr: 1 }}
        >
          View Profile
        </Button>
        <Button 
          size="small" 
          variant="contained" 
          onClick={handleBookAppointment}
          sx={{ ml: 'auto' }}
        >
          Book Appointment
        </Button>
      </CardActions>
    </Card>
  );
};

export default DoctorCard;