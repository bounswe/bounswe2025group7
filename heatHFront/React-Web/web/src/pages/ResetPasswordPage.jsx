import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Simple validation
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    // Simulate a backend call for password reset
    console.log(`OTP entered: ${otp}`);
    console.log(`Resetting password for: ${emailFromState}`);
    console.log(`New Password: ${newPassword}`);
    setMessage('Your password has been updated successfully.');
    // Optionally navigate to sign in after a delay.
    setTimeout(() => {
      navigate('/signin');
    }, 2000);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body1" gutterBottom>
          Please enter the one-time code sent to <strong>{emailFromState}</strong> along with your new password.
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="One-Time Code"
            variant="outlined"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <TextField
            label="New Password"
            variant="outlined"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <TextField
            label="Confirm New Password"
            variant="outlined"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Reset Password
          </Button>
        </form>
        {message && (
          <Typography variant="body2" color={message.includes('successfully') ? 'success.main' : 'error'} sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;