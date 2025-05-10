import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, Divider, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../images/logo.png';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import authService from '../services/authService';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
}));

const StyledToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
});

const NavButton = styled(Button)({
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

const LogoLink = styled(Link)({
  textDecoration: 'none',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  '&:hover': {
    color: 'white',
  },
});

const Footer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(3),
  marginTop: 'auto',
}));

const Template = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <StyledAppBar position="static">
        <StyledToolbar>
          {/* Logo at the far left */}
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 48 }}>
            <img
              src={logo}
              alt="HeatH logo"
              style={{
                height: 52,
                width: 52,
                borderRadius: '50%',
                background: 'white',
                objectFit: 'cover',
              }}
            />
          </Box>

          {/* Centered title */}
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h6" component="div">
              HeatH
            </Typography>
          </Box>

          {/* Navigation buttons on the right */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <NavButton
              component={Link}
              to="/home"
              color={location.pathname === '/home' ? 'secondary' : 'inherit'}
              startIcon={<HomeIcon />}
            >
              Home
            </NavButton>
            <NavButton
              component={Link}
              to="/profile"
              color={location.pathname === '/profile' ? 'secondary' : 'inherit'}
              startIcon={<PersonIcon />}
            >
              Profile
            </NavButton>
            <NavButton
              component={Link}
              to="/saved"
              color={location.pathname === '/saved' ? 'secondary' : 'inherit'}
              startIcon={<BookmarkIcon />}
            >
              Saved Recipes
            </NavButton>
            <IconButton
              color="inherit"
              onClick={handleLogout}
              sx={{ ml: 2 }}
              title="Log Out"
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </StyledToolbar>
      </StyledAppBar>
      <Container sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
      <Footer>
        <Container>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="body2">
              © 2024 HeatH. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link to="/privacy" style={{ color: 'white', textDecoration: 'none' }}>
                <Typography variant="body2">Privacy Policy</Typography>
              </Link>
              <Link to="/terms" style={{ color: 'white', textDecoration: 'none' }}>
                <Typography variant="body2">Terms of Service</Typography>
              </Link>
              <Link to="/contact" style={{ color: 'white', textDecoration: 'none' }}>
                <Typography variant="body2">Contact Us</Typography>
              </Link>
            </Box>
          </Box>
        </Container>
      </Footer>
    </Box>
  );
};

export default Template; 