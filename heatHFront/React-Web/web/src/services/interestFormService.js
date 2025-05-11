import apiClient from './apiClient';
import axios from 'axios';

const interestFormService = {
  // Returns true if the user has not yet submitted the interest form
  checkFirstLogin: async () => {
    // Freshly registered users skip backend check
    if (sessionStorage.getItem('justRegistered') === 'true') {
      return true;
    }
    try {
      const response = await apiClient.get('/interest-form/check-first-login');
      return response.data;
    } catch (err) {
      // If endpoint not found or form doesn't exist/forbidden, treat as first login
      if (axios.isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 403)) {
        return false;
      }
      throw err;
    }
  },

  // Create a new interest form entry
  createInterestForm: async (data) => {
    const response = await apiClient.post('/interest-form/submit', data);
    return response.data;
  },

  // Fetch the existing interest form data
  getInterestForm: async () => {
    const response = await apiClient.get('/interest-form/get-form');
    return response.data;
  },

  // Update existing interest form data
  updateInterestForm: async (data) => {
    const response = await apiClient.put('/interest-form/update-form', data);
    return response.data;
  },
};

export default interestFormService; 