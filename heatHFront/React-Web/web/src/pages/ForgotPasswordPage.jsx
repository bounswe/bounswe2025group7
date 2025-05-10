import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Simulate sending OTP. Replace with backend integration later.
    console.log(`OTP request sent for ${email}`);
    setMessage('If this email exists in our records, a one-time code has been sent.');
    // Simulate a delay and then navigate to reset password page.
    setTimeout(() => {
      navigate('/reset-password', { state: { email } });
    }, 2000);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Forgot Password
        </Typography>
        <Typography variant="body1" gutterBottom>
          Enter your email address below to receive a one-time code for password reset.
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email Address"
            variant="outlined"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Send OTP
          </Button>
        </form>
        {message && (
          <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
        <Button component={RouterLink} to="/signin" sx={{ mt: 2 }} fullWidth>
          Back to Sign In
        </Button>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;