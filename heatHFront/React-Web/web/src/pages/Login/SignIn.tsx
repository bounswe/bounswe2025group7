import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Link } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../../services/authService';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import interestFormService from '../../services/interestFormService';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';



export default function SigninPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const successMsg = location.state?.success || '';
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  // On mount, if token exists check first-login; invalid token sends to signin
  useEffect(() => {
    // If coming straight from registration, skip validation and go to setup
    if (sessionStorage.getItem('justRegistered') === 'true') {
      sessionStorage.removeItem('justRegistered');
      navigate('/profile/setup');
      return;
    }
    const refresh = authService.getRefreshToken();
    if (!refresh) {
      authService.logout();
      return;
    }
    // Validate token by attempting to refresh
    authService.refreshToken()
      .then(() => {
        // If refresh succeeds, check first-login flag
        return interestFormService.checkFirstLogin();
      })
      .then((firstLogin) => {
        // If service returns false, show setup; true means already done, go home
        if (!firstLogin) navigate('/profile/setup');
        else navigate('/home');
      })
      .catch(() => {
        // Invalid or expired tokens
        authService.logout();
        navigate('/signin');
      });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await authService.login(form);
      // If just registered, direct to setup and clear flag
      if (sessionStorage.getItem('justRegistered') === 'true') {
        sessionStorage.removeItem('justRegistered');
        navigate('/profile/setup');
        return;
      }
      // After login, check first-login flag (false means show setup)
      let firstLogin;
      try {
        firstLogin = await interestFormService.checkFirstLogin();
      } catch (err) {
        if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
          authService.logout();
          navigate('/signin');
          return;
        }
        firstLogin = false;
      }
      if (!firstLogin) navigate('/profile/setup');
      else navigate('/home');

    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || t('auth.invalidCredentials'));
      } else {
        setError(t('auth.invalidCredentials'));
      }
    }
  };

  // Handler for Enter key press to submit login
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setError('');
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <Typography variant="h5">{t('auth.signInTitle')}</Typography>

        {successMsg && (
          <Typography color="primary" variant="body2" sx={{ mt: 1 }}>
            {successMsg}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} onKeyDown={handleKeyDown} sx={{ mt: 2, width: '100%' }}>
          <TextField
            label={t('common.email')}
            name="username"
            type="email"
            value={form.username}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />

          <TextField
            label={t('common.password')}
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
            {t('common.signIn')}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/forgot-password" underline="hover">
              {t('common.forgotPassword')}
            </Link>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              {t('auth.dontHaveAccount')}&nbsp;
              <Link href="/signup">{t('auth.signUpHere')}</Link>
            </Typography>
          </Box>
          <Box textAlign="center" mt={3}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ alignSelf: 'flex-start', mb: 5 }}>
              {t('common.back')}
            </Button>
          </Box>


        </Box>
      </Box>
    </Container>
  );
}
