import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SavingsIcon from '@mui/icons-material/Savings';
import ScheduleIcon from '@mui/icons-material/Schedule';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import logo from '../images/logo.png';
import LanguageSwitcher from '../components/LanguageSwitcher';

const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(12, 0, 14),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '30%',
    background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 100%)',
    transform: 'skewY(-3deg)',
    transformOrigin: 'bottom right',
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  borderRadius: '16px',
  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 30px rgba(0,0,0,0.12)',
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '30px',
  padding: theme.spacing(1.2, 4),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
  }
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'transparent',
  boxShadow: 'none',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
}));

const Footer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(3),
  marginTop: 'auto',
}));

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  return (
    <Box>
      {/* Navigation Bar */}
      <StyledAppBar>
        <Toolbar sx={{ position: 'relative', justifyContent: 'space-between' }}>
          {/* Logo and title */}
          <Link component={RouterLink} to="/" color="inherit" underline="none" sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 48 }}>
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
            <Typography variant="h6" component="div">HeatH</Typography>
          </Link>
          {/* Navigation buttons on the right */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <LanguageSwitcher variant="icon" />
            <Link
              component={RouterLink}
              to="/signin"
              color="inherit"
              underline="none"
              sx={{
                '&:hover': {
                  color: theme.palette.secondary.main,
                },
              }}
            >
              {t('common.signIn')}
            </Link>
            <Link
              component={RouterLink}
              to="/signup"
              color="inherit"
              underline="none"
              sx={{
                '&:hover': {
                  color: theme.palette.secondary.main,
                },
              }}
            >
              {t('common.signUp')}
            </Link>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <img
              src={logo}
              alt="HeatH logo"
              style={{
                height: 124,
                width: 124,
                borderRadius: '50%',
                background: 'white',
                objectFit: 'cover',
              }}
            />
          </Box>
          <Typography 
            variant="h1"
            gutterBottom
            sx={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
              mb: 3
            }}
          >
            {t('landing.title')}
          </Typography>
          <Typography 
            variant="h5" 
            gutterBottom
            sx={{ 
              maxWidth: '800px',
              mx: 'auto',
              mb: 4,
              opacity: 0.9
            }}
          >
            {t('landing.subtitle')}
          </Typography>
          <Button
            component={RouterLink}
            to="/signup"
            variant="contained"
            color="secondary"
            size="large"
            endIcon={<KeyboardArrowRightIcon />}
          >
            {t('landing.getStarted')}
          </Button>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, mt: -6, position: 'relative', zIndex: 10 }}>
        <Box sx={{ 
          bgcolor: 'background.paper', 
          borderRadius: '24px', 
          py: 6, 
          px: { xs: 3, md: 6 }, 
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <Typography 
            variant="h3" 
            align="center" 
            gutterBottom
            sx={{ mb: 6 }}
          >
            {t('landing.whyChoose')}
          </Typography>
          <Grid 
            container 
            spacing={4} 
            justifyContent="center"
            alignItems="stretch"
            sx={{ maxWidth: '1200px', mx: 'auto' }}
          >
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 4, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <FeatureIcon>
                    <SavingsIcon fontSize="inherit" />
                  </FeatureIcon>
                  <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                    {t('landing.budgetFriendly')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t('landing.budgetFriendlyDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 4, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <FeatureIcon>
                    <RestaurantIcon fontSize="inherit" />
                  </FeatureIcon>
                  <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                    {t('landing.healthyChoices')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t('landing.healthyChoicesDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 4, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <FeatureIcon>
                    <ScheduleIcon fontSize="inherit" />
                  </FeatureIcon>
                  <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                    {t('landing.easyPlanning')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t('landing.easyPlanningDesc')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* CTA Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)', 
        py: { xs: 8, md: 12 },
        mt: { xs: 4, md: 8 }
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ mb: 3 }}
          >
            {t('landing.readyToStart')}
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            paragraph
            sx={{ 
              mb: 4,
              maxWidth: '700px',
              mx: 'auto'
            }}
          >
            {t('landing.readyToStartDesc')}
          </Typography>
          <Button
            component={RouterLink}
            to="/signup"
            variant="contained"
            color="primary"
            size="large"
            endIcon={<KeyboardArrowRightIcon />}
          >
            {t('landing.signUpFree')}
          </Button>
        </Container>
      </Box>

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
              <Link to="/privacy" component={RouterLink} style={{ color: 'white', textDecoration: 'none' }}>
                <Typography variant="body2">{t('landing.privacyPolicy')}</Typography>
              </Link>
              <Link to="/terms" component={RouterLink} style={{ color: 'white', textDecoration: 'none' }}>
                <Typography variant="body2">{t('landing.termsOfService')}</Typography>
              </Link>
              <Link to="/contact" component={RouterLink} style={{ color: 'white', textDecoration: 'none' }}>
                <Typography variant="body2">{t('landing.contactUs')}</Typography>
              </Link>
            </Box>
          </Box>
        </Container>
      </Footer>
    </Box>
  );
};

export default LandingPage; 