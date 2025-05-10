import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import interestFormService from '../../services/interestFormService';

export default function SigninPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  // If already authenticated, redirect on mount
  useEffect(() => {
    const token = authService.getAccessToken();
    if (token) {
      interestFormService.checkFirstLogin().then((firstLogin) => {
        if (firstLogin) navigate('/profile/setup');
        else navigate('/home');
      });
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      await authService.login(form);
      // After login, decide whether to show the interest form
      const firstLogin = await interestFormService.checkFirstLogin();
      if (firstLogin) {
        navigate('/profile/setup');
      } else {
        navigate('/home');
      }
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
