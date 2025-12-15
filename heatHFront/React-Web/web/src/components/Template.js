import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, Divider, IconButton, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../images/logo.png';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import authService from '../services/authService';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import LanguageSwitcher from './LanguageSwitcher';
import SearchIcon from '@mui/icons-material/Search';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import SearchBar from './SearchBar';
import DarkModeToggle from './DarkModeToggle';

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
  const { t } = useTranslation();
  const theme = useTheme();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: 'background.default',
      color: 'text.primary',
    }}>
      <StyledAppBar position="fixed">
        <StyledToolbar>
          {/* Logo at the far left */}
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 48, gap: 2 }}>
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
            <Typography variant="h6" component="div">
              HeatH
            </Typography>
          </Box>



          {/* Search bar in the center */}
          <SearchBar />

          {/* Navigation buttons on the right */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <DarkModeToggle />
            <LanguageSwitcher variant="text" />

            <NavButton
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              {t('common.logout')}
            </NavButton>
          </Box>
        </StyledToolbar>
      </StyledAppBar>
      {/* Spacer to offset fixed AppBar */}
      <Toolbar />
      <Container sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left-side navigation box (Explore) */}
          <Box
            sx={{
              width: 240,
              flexShrink: 0,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              position: 'sticky',
              top: 96,
              height: 'fit-content',
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              {t('common.navigation')}
            </Typography>

            <NavButton
              component={Link}
              to="/home"
              startIcon={<HomeIcon />}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: location.pathname.startsWith('/home') ? 'primary.main' : 'text.primary',
                backgroundColor: location.pathname.startsWith('/home') ? 'rgba(0, 128, 0, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname.startsWith('/home') ? 'rgba(0, 128, 0, 0.12)' : 'action.hover',
                },
              }}
            >
              {t('common.home')}
            </NavButton>

            <NavButton
              component={Link}
              to="/profile"
              startIcon={<PersonIcon />}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: location.pathname.startsWith('/profile') ? 'primary.main' : 'text.primary',
                backgroundColor: location.pathname.startsWith('/profile') ? 'rgba(0, 128, 0, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname.startsWith('/profile') ? 'rgba(0, 128, 0, 0.12)' : 'action.hover',
                },
              }}
            >
              {t('common.profile')}
            </NavButton>

            <NavButton
              component={Link}
              to="/myrecipes"
              startIcon={<RestaurantMenuIcon />}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: location.pathname.startsWith('/myrecipes') ? 'primary.main' : 'text.primary',
                backgroundColor: location.pathname.startsWith('/myrecipes') ? 'rgba(0, 128, 0, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname.startsWith('/myrecipes') ? 'rgba(0, 128, 0, 0.12)' : 'action.hover',
                },
              }}
            >
              {t('recipes.myRecipes')}
            </NavButton>

            <NavButton
              component={Link}
              to="/saved"
              startIcon={<BookmarkIcon />}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: location.pathname.startsWith('/saved') ? 'primary.main' : 'text.primary',
                backgroundColor: location.pathname.startsWith('/saved') ? 'rgba(0, 128, 0, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname.startsWith('/saved') ? 'rgba(0, 128, 0, 0.12)' : 'action.hover',
                },
              }}
            >
              {t('recipes.savedRecipes')}
            </NavButton>

            <NavButton
              component={Link}
              to="/calorie-tracking"
              startIcon={<MonitorWeightIcon />}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: location.pathname.startsWith('/calorie-tracking') ? 'primary.main' : 'text.primary',
                backgroundColor: location.pathname.startsWith('/calorie-tracking') ? 'rgba(0, 128, 0, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname.startsWith('/calorie-tracking') ? 'rgba(0, 128, 0, 0.12)' : 'action.hover',
                },
              }}
            >
              {t('calorieTracking.title')}
            </NavButton>
          </Box>

          {/* Main content centered */}
          <Box sx={{ flex: 1 }}>
            {children}
          </Box>
        </Box>
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
              {t('landing.copyright')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link to="/privacy" style={{ color: 'white', textDecoration: 'none' }}>
                <Typography variant="body2">{t('landing.privacyPolicy')}</Typography>
              </Link>
              <Link to="/terms" style={{ color: 'white', textDecoration: 'none' }}>
                <Typography variant="body2">{t('landing.termsOfService')}</Typography>
              </Link>
              <Link to="/contact" style={{ color: 'white', textDecoration: 'none' }}>
                <Typography variant="body2">{t('landing.contactUs')}</Typography>
              </Link>
            </Box>
          </Box>
        </Container>
      </Footer>
    </Box>
  );
};

export default Template; 
