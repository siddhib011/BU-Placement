import React from 'react';
import { useNavigate } from 'react-router-dom';

// --- MUI Imports ---
import { Container, Typography, Button, Box, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import GroupIcon from '@mui/icons-material/Group';
// --- End MUI Imports ---

// --- Custom Styled Components ---

// Container for the main hero section with a light background
const HeroSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0, 8),
  backgroundColor: theme.palette.background.default,
  textAlign: 'center',
  minHeight: '80vh', // Takes up most of the viewport height
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

// Style for the feature cards
const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  boxShadow: theme.shadows[3], // Add some depth
}));

// --- Main Component ---
const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <Container maxWidth="xl"> {/* Wider container for the whole page */}
      <HeroSection>
        
        {/* Title and Logo */}
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* The Image Logo */}
            <Box component="img" src="/app-logo.png" alt="Portal Logo" sx={{ width: 100, height: 100, mb: 2 }} />
            
            {/* Main Heading */}
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'secondary.main' }}>
              Your Placement Journey Starts Here
            </Typography>

            {/* Subheading */}
            <Typography variant="h5" color="text.secondary" paragraph>
              The unified platform connecting students, recruiters, and the Placement Cell of BU.
            </Typography>
        </Box>

        {/* Get Started Button */}
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={handleGetStarted}
          sx={{ mt: 2, mb: 6, padding: '10px 40px', fontSize: '1.2rem', boxShadow: 3 }}
        >
          Get Started
        </Button>

        {/* --- Feature Section --- */}
        <Container maxWidth="md">
            <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 500 }}>
                A Seamless Ecosystem
            </Typography>
            <Grid container spacing={4}>
                {/* Feature 1: Students */}
                <Grid item xs={12} sm={4}>
                    <FeatureCard>
                        <SchoolIcon color="secondary" sx={{ fontSize: 40, mb: 2 }} />
                        <Typography variant="h6">Students</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Create verified profiles, upload resumes, track your applications, and discover real-time job listings.
                        </Typography>
                    </FeatureCard>
                </Grid>
                {/* Feature 2: Recruiters */}
                <Grid item xs={12} sm={4}>
                    <FeatureCard>
                        <WorkIcon color="secondary" sx={{ fontSize: 40, mb: 2 }} />
                        <Typography variant="h6">Recruiters</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Post, edit, and delete job openings instantly. View detailed student profiles and manage all applicants.
                        </Typography>
                    </FeatureCard>
                </Grid>
                {/* Feature 3: Placement Cell */}
                <Grid item xs={12} sm={4}>
                    <FeatureCard>
                        <GroupIcon color="secondary" sx={{ fontSize: 40, mb: 2 }} />
                        <Typography variant="h6">Placement Cell</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Maintain oversight with access to all student data, job metrics, and application status across the portal.
                        </Typography>
                    </FeatureCard>
                </Grid>
            </Grid>
        </Container>
      </HeroSection>
    </Container>
  );
};

export default HomePage;