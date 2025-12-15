import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Container,
  Box,
  Divider,
  Tooltip,
  Avatar,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../images/logo.png';
import authService from '../services/authService';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import LanguageSwitcher from './LanguageSwitcher';
import SearchIcon from '@mui/icons-material/Search';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';

const NavButton = styled(Button)(({ theme }) => ({
  justifyContent: 'flex-start',
  color: theme.palette.text.primary,
  borderRadius: 12,
  padding: '10px 12px',
  gap: 12,
  minHeight: 44,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const Footer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(3),
  marginTop: 'auto',
}));

const NAV_COLLAPSED_WIDTH = 76;
const NAV_EXPANDED_WIDTH = 232;

const navItems = [
  { key: 'home', label: 'common.home', to: '/home', icon: HomeIcon, group: 'primary' },
  { key: 'profile', label: 'common.profile', to: '/profile', icon: PersonIcon, group: 'primary' },
  { key: 'search', label: 'common.search', to: '/search', icon: SearchIcon, group: 'primary' },
  { key: 'myrecipes', label: 'recipes.myRecipes', to: '/myrecipes', icon: RestaurantMenuIcon, group: 'secondary' },
  { key: 'saved', label: 'recipes.savedRecipes', to: '/saved', icon: BookmarkIcon, group: 'secondary' },
  { key: 'calorie', label: 'calorieTracking.title', to: '/calorie-tracking', icon: MonitorWeightIcon, group: 'secondary' },
];

const pageTitles = [
  { path: '/home', label: 'common.home' },
  { path: '/profile', label: 'common.profile' },
  { path: '/search', label: 'common.search' },
  { path: '/myrecipes', label: 'recipes.myRecipes' },
  { path: '/saved', label: 'recipes.savedRecipes' },
  { path: '/calorie-tracking', label: 'calorieTracking.title' },
];

const Template = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  const [navExpanded, setNavExpanded] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(`${to}/`);

  const labelSx = {
    opacity: navExpanded ? 1 : 0,
    width: navExpanded ? 'auto' : 0,
    transition: 'opacity 180ms ease, width 180ms ease',
    whiteSpace: 'nowrap',
  };

  const headerTitle = useMemo(() => {
    const match = pageTitles.find((p) => location.pathname.startsWith(p.path));
    return match ? t(match.label) : '';
  }, [location.pathname, t]);

  const renderNavButton = (item) => {
    const Icon = item.icon;
    const active = isActive(item.to);
    const button = (
      <NavButton
        component={Link}
        to={item.to}
        aria-current={active ? 'page' : undefined}
        startIcon={<Icon />}
        sx={{
          backgroundColor: active ? theme.palette.action.selected : 'transparent',
          color: active ? theme.palette.primary.main : theme.palette.text.primary,
          '& .MuiSvgIcon-root': {
            color: active ? theme.palette.primary.main : theme.palette.text.secondary,
          },
          '&:hover .MuiSvgIcon-root': {
            color: theme.palette.primary.main,
          },
        }}
      >
        <Typography variant="body2" sx={labelSx}>
          {t(item.label)}
        </Typography>
      </NavButton>
    );

    return navExpanded ? (
      button
    ) : (
      <Tooltip title={t(item.label)} placement="right">
        <Box>{button}</Box>
      </Tooltip>
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Left rail */}
      <Box
        onMouseEnter={() => setNavExpanded(true)}
        onMouseLeave={() => setNavExpanded(false)}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: navExpanded ? NAV_EXPANDED_WIDTH : NAV_COLLAPSED_WIDTH,
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          transition: 'width 180ms ease',
          px: 1.5,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
          zIndex: 1200,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
          <Avatar
            src={logo}
            alt="HeatH logo"
            sx={{ height: 44, width: 44, bgcolor: 'white', border: '1px solid', borderColor: 'divider' }}
          />
          <Typography
            variant="h6"
            sx={{
              ...labelSx,
              fontWeight: 700,
            }}
          >
            HeatH
          </Typography>
        </Box>

        {navItems.filter((i) => i.group === 'primary').map((item) => renderNavButton(item))}

        <Divider sx={{ my: 0.5 }} />

        {navItems.filter((i) => i.group === 'secondary').map((item) => renderNavButton(item))}

        <LanguageSwitcher variant={navExpanded ? 'text' : 'icon'} />

        <NavButton onClick={handleLogout} startIcon={<LogoutIcon />}>
          <Typography variant="body2" sx={labelSx}>{t('common.logout')}</Typography>
        </NavButton>
      </Box>

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          ml: navExpanded ? `${NAV_EXPANDED_WIDTH + 16}px` : `${NAV_COLLAPSED_WIDTH + 16}px`,
          transition: 'margin-left 180ms ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Page header */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            bgcolor: 'background.default',
            px: { xs: 2, md: 3 },
            pt: 3,
            pb: 1.5,
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            {headerTitle || ' '}
          </Typography>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 2, mb: 4, flex: 1 }}>
          {children}
        </Container>

        <Footer>
          <Container>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Typography variant="body2">{t('landing.copyright')}</Typography>
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
    </Box>
  );
};

export default Template;

