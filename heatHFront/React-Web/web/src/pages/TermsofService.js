import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Template from '../components/Template';

const TermsOfService = () => {
  return (
    <Template>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ mb: 3, color: 'primary.main' }}>
            Terms of Service
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Welcome to HeatH! By using our services, you agree to the following terms and conditions. Please read them carefully.
          </Typography>
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            Use of Services
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You agree to use our services responsibly and in compliance with all applicable laws. Any misuse of our platform may result in termination of your account.
          </Typography>
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            Intellectual Property
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            All content on HeatH, including text, images, and code, is the property of HeatH. You may not reproduce or distribute our content without permission.
          </Typography>
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            Limitation of Liability
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            HeatH is not liable for any damages resulting from the use of our services. Use our platform at your own risk.
          </Typography>
        </Box>
      </Container>
    </Template>
  );
};

export default TermsOfService;