import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Template from '../components/Template';

const PrivacyPolicy = () => {
  return (
    <Template>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box>
          <Typography variant="h3" sx={{ mb: 3, color: 'primary.main' }}>
            Privacy Policy
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            At HeatH, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data.
          </Typography>
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            Information We Collect
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            We may collect personal information such as your name, email address, and preferences when you use our services. Additionally, we may collect non-personal data such as browser type and usage statistics.
          </Typography>
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            How We Use Your Information
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your information is used to improve our services, provide personalized experiences, and communicate with you. We do not sell your data to third parties.
          </Typography>
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            Your Rights
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You have the right to access, update, or delete your personal information. If you have any concerns about your data, please contact us.
          </Typography>
        </Box>
      </Container>
    </Template>
  );
};

export default PrivacyPolicy;