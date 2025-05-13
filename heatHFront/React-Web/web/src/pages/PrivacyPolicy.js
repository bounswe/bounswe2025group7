import React from 'react';
import { Box, Container, Typography, AppBar, Toolbar, Link, useMediaQuery, Button, IconButton } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import logo from '../images/logo.png';
import authService from '../services/authService';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LogoutIcon from '@mui/icons-material/Logout';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.primary.main,
  boxShadow: 'none',
  position: 'static',
  color: theme.palette.primary.contrastText,
}));

const Footer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(3),
  marginTop: 'auto',
}));

const PrivacyPolicy = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const loggedIn = !!authService.getRefreshToken();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <StyledAppBar>
        <Toolbar sx={{ position: 'relative', justifyContent: 'space-between' }}>
          <Link component={RouterLink} to="/" color="inherit" underline="none" sx={{ display: 'flex', alignItems: 'center', minWidth: 48 }}>
            <img
              src={logo}
              alt="HeatH logo"
              style={{
                height: 42,
                width: 42,
                borderRadius: '50%',
                background: 'white',
                objectFit: 'cover',
              }}
            />
          </Link>
          <Link component={RouterLink} to="/" color="inherit" underline="none" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="div" color="inherit">HeatH</Typography>
          </Link>
          {/* Navigation buttons (signed in vs guest) */}
          {loggedIn ? (
            <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2, alignItems: 'center' }}>
              <Button component={RouterLink} to="/home" color="inherit" startIcon={<HomeIcon />}>Home</Button>
              <Button component={RouterLink} to="/profile" color="inherit" startIcon={<PersonIcon />}>Profile</Button>
              <Button component={RouterLink} to="/myrecipes" color="inherit" startIcon={<RestaurantMenuIcon />}>My Recipes</Button>
              <Button component={RouterLink} to="/saved" color="inherit" startIcon={<BookmarkIcon />}>Saved</Button>
              <IconButton color="inherit" onClick={() => { authService.logout(); navigate('/'); }}><LogoutIcon /></IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link component={RouterLink} to="/signin" color="inherit" underline="none" sx={{ '&:hover': { color: theme.palette.secondary.main } }}>Sign In</Link>
              <Link component={RouterLink} to="/signup" color="inherit" underline="none" sx={{ '&:hover': { color: theme.palette.secondary.main } }}>Sign Up</Link>
            </Box>
          )}
        </Toolbar>
      </StyledAppBar>
      <Container maxWidth="md" sx={{ flex: 1, py: 4, mt: 8 }}>
        <Box>
          <Typography variant="h3" sx={{ mb: 3, color: 'primary.main' }}>
            Privacy Policy
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            At HeatH, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data.
          </Typography>
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            Information We Collect
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            We may collect personal information such as your name, email address, and preferences when you use our services. Additionally, we may collect non-personal data such as browser type and usage statistics.
          </Typography>
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            How We Use Your Information
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your information is used to improve our services, provide personalized experiences, and communicate with you. We do not sell your data to third parties.
          </Typography>
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            Your Rights
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You have the right to access, update, or delete your personal information. If you have any concerns about your data, please contact us.
          </Typography>
        </Box>
      </Container>
      <Footer>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2">© 2024 HeatH. All rights reserved.</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link component={RouterLink} to="/privacy" underline="none" sx={{ color: 'white', textDecoration: 'none' }}>
                <Typography variant="body2">Privacy Policy</Typography>
              </Link>
              <Link component={RouterLink} to="/terms" underline="none" sx={{ color: 'white', textDecoration: 'none' }}>
                <Typography variant="body2">Terms of Service</Typography>
              </Link>
              <Link component={RouterLink} to="/contact" underline="none" sx={{ color: 'white', textDecoration: 'none' }}>
                <Typography variant="body2">Contact Us</Typography>
              </Link>
            </Box>
          </Box>
        </Container>
      </Footer>
    </Box>
  );
};

export default PrivacyPolicy;