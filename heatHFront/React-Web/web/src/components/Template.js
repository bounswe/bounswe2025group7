import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, Divider, IconButton } from '@mui/material';
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



          {/* Navigation buttons on the right */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <NavButton
              component={Link}
              to="/profile"
              color={location.pathname === '/profile' ? 'secondary' : 'inherit'}
              startIcon={<PersonIcon />}
            >
              {t('common.profile')}
            </NavButton>

            <LanguageSwitcher variant="text" />

            <IconButton
              color="inherit"
              onClick={handleLogout}
              sx={{ ml: 2 }}
              title={t('common.logout')}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </StyledToolbar>
      </StyledAppBar>
      {/* Spacer to offset fixed AppBar */}
      <Toolbar />
      <Container sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Main content */}
          <Box sx={{ flex: 1 }}>
            {children}
          </Box>

          {/* Right-side navigation box */}
          <Box
            sx={{
              width: 240,
              flexShrink: 0,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              position: 'sticky',
              top: 96,
              height: 'fit-content',
              backgroundColor: '#fff',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              {t('common.navigation')}
            </Typography>

            <NavButton
              component={Link}
              to="/home"
              color={location.pathname === '/home' ? 'secondary' : 'inherit'}
              startIcon={<HomeIcon />}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: 'text.primary',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              {t('common.home')}
            </NavButton>

            <NavButton
              component={Link}
              to="/search"
              color={location.pathname === '/search' ? 'secondary' : 'inherit'}
              startIcon={<SearchIcon />}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: 'text.primary',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              {t('common.search')}
            </NavButton>

            <NavButton
              component={Link}
              to="/myrecipes"
              color={location.pathname === '/myrecipes' ? 'secondary' : 'inherit'}
              startIcon={<RestaurantMenuIcon />}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: 'text.primary',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              {t('recipes.myRecipes')}
            </NavButton>

            <NavButton
              component={Link}
              to="/saved"
              color={location.pathname === '/saved' ? 'secondary' : 'inherit'}
              startIcon={<BookmarkIcon />}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: 'text.primary',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              {t('recipes.savedRecipes')}
            </NavButton>

            <NavButton
              component={Link}
              to="/calorie-tracking"
              color={location.pathname === '/calorie-tracking' ? 'secondary' : 'inherit'}
              startIcon={<MonitorWeightIcon />}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: 'text.primary',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              {t('calorieTracking.title')}
            </NavButton>
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
