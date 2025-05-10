import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Link } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import interestFormService from '../../services/interestFormService';

export default function SigninPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const successMsg = location.state?.success || '';
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  // On mount, if token exists check first-login; invalid token sends to signin
  useEffect(() => {
    const refresh = authService.getRefreshToken();
    if (!refresh) {
      authService.logout();
      return;
    }
    // Validate token by attempting to refresh
    authService.refreshToken()
      .then(() => {
        // If refresh succeeds, check first-login
        return interestFormService.checkFirstLogin();
      })
      .then((firstLogin) => {
        if (firstLogin) navigate('/profile/setup');
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
      // After login, decide next route: invalid token -> signin, else form or home
      let firstLogin;
      try {
        firstLogin = await interestFormService.checkFirstLogin();
      } catch (err) {
        if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
          authService.logout();
          navigate('/signin');
          return;
        }
        firstLogin = true;
      }
      if (firstLogin) navigate('/profile/setup');
      else navigate('/home');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Login failed');
      } else {
        setError('Login failed');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5">Sign In</Typography>

        {successMsg && (
          <Typography color="primary" variant="body2" sx={{ mt: 1 }}>
            {successMsg}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
          <TextField
            label="Username"
            name="username"
            type="email"
            value={form.username}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />

          <TextField
            label="Password"
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
            Sign In
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/forgot-password" underline="hover">
              Forgot Password?
            </Link>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don&apos;t have an account?&nbsp;
              <Link href="/signup">Sign Up</Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
