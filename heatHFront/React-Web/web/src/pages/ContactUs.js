import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Alert } from '@mui/material';
import Template from '../components/Template';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSuccess(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <Template>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ mb: 3, color: 'primary.main' }}>
            Contact Us
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Have questions or feedback? We'd love to hear from you! Fill out the form below, and we'll get back to you as soon as possible.
          </Typography>
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Thank you for reaching out! We'll get back to you soon.
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ mb: 3 }}
              multiline
              rows={4}
              required
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Submit
            </Button>
          </Box>
        </Box>
      </Container>
    </Template>
  );
};

export default ContactUs;