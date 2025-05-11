import { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import authService from '../../services/authService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await authService.register(form);
      // Clear tokens and mark newly registered
      authService.logout();
      sessionStorage.setItem('justRegistered', 'true');
      navigate('/signin', { state: { success: 'Registration successful! Please sign in.' } });
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.status === 409 || err.response?.status === 403)) {
        setError(
          <>An account is already registered with this email.{' '}
            <Link component={RouterLink} to="/signin" underline="hover">
              Sign in here.
            </Link>
          </>
        );
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <Typography variant="h5">Sign Up</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
          <TextField
            label="Email Address"
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
            Register
          </Button>
          
        </Box>
        <Box textAlign="center" mt={3}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ alignSelf: 'flex-start', mb: 5 }}>
              Back
            </Button>
          </Box>
      </Box>
    </Container>
  );
}