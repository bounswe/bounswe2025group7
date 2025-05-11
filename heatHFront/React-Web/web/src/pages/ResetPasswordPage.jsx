import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient'; // Import your API client

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    
    // Client-side validation
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    
    try {
      // Create payload for the backend API
      const payload = {
        email: emailFromState,
        newPassword: newPassword
      };

      // Make API call to reset password
      const response = await apiClient.post('/auth/reset-password', payload);
      
      // Handle success
      setMessage('Your password has been updated successfully.');
      
      // Navigate to sign in after a delay
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (error) {
      // Handle errors
      console.error('Password reset failed:', error);
      
      // Extract error message from response if available
      const errorMessage = error.response?.data || 'Password reset failed. Please try again.';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reset Password
        </Typography>
        <Typography variant="body1" gutterBottom>
          Please enter your new password for <strong>{emailFromState}</strong>.
        </Typography>
        <form onSubmit={handleSubmit}>
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
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
        </form>
        {message && (
          <Typography 
            variant="body2" 
            color={message.includes('successfully') ? 'success.main' : 'error'} 
            sx={{ mt: 2 }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;