import { useState } from 'react';
import { Container, Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' }); // Removed the "name" field
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await authService.register(form);
      navigate('/profile/setup');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <Typography variant="h5">Sign Up</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
          <TextField
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
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