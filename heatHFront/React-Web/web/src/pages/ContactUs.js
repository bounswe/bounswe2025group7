import React, { useState } from 'react';
import { Box, Container, Typography, AppBar, Toolbar, Link, useMediaQuery, TextField, Button as MUIButton, Alert, IconButton } from '@mui/material';
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

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const loggedIn = !!authService.getRefreshToken();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSuccess(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <StyledAppBar>
        <Toolbar sx={{ position: 'relative', justifyContent: 'space-between' }}>
          {/* Logo and title */}
          <Link component={RouterLink} to="/" color="inherit" underline="none" sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 48 }}>
            <img
              src={logo}
              alt="HeatH logo"
              style={{ height: 42, width: 42, borderRadius: '50%', background: 'white', objectFit: 'cover' }}
            />
            <Typography variant="h6" component="div" color="inherit">HeatH</Typography>
          </Link>
          {loggedIn ? (
            <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2, alignItems: 'center' }}>
              <MUIButton component={RouterLink} to="/home" color="inherit" startIcon={<HomeIcon />}>Home</MUIButton>
              <MUIButton component={RouterLink} to="/profile" color="inherit" startIcon={<PersonIcon />}>Profile</MUIButton>
              <MUIButton component={RouterLink} to="/myrecipes" color="inherit" startIcon={<RestaurantMenuIcon />}>My Recipes</MUIButton>
              <MUIButton component={RouterLink} to="/saved" color="inherit" startIcon={<BookmarkIcon />}>Saved</MUIButton>
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
      <Container maxWidth="sm" sx={{ flex: 1, py: 4, mt: 8 }}>
        <Box>
          <Typography variant="h3" sx={{ mb: 3, color: 'primary.main' }}>Contact Us</Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>Have questions or feedback? We'd love to hear from you! Fill out the form below, and we'll get back to you as soon as possible.</Typography>
          {success && <Alert severity="success" sx={{ mb: 3 }}>Thank you for reaching out! We'll get back to you soon.</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Name" value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} required />
            <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} required />
            <TextField fullWidth label="Message" value={message} onChange={(e) => setMessage(e.target.value)} sx={{ mb: 3 }} multiline rows={4} required />
            <MUIButton type="submit" variant="contained" color="primary" fullWidth>Submit</MUIButton>
          </Box>
        </Box>
      </Container>
      <Footer>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2">© 2025 HeatH. All rights reserved.</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link to="/privacy" component={RouterLink} underline="none" sx={{ color: 'white', textDecoration: 'none' }}><Typography variant="body2">Privacy Policy</Typography></Link>
              <Link to="/terms" component={RouterLink} underline="none" sx={{ color: 'white', textDecoration: 'none' }}><Typography variant="body2">Terms of Service</Typography></Link>
              <Link to="/contact" component={RouterLink} underline="none" sx={{ color: 'white', textDecoration: 'none' }}><Typography variant="body2">Contact Us</Typography></Link>
            </Box>
          </Box>
        </Container>
      </Footer>
    </Box>
  );
};

export default ContactUs;