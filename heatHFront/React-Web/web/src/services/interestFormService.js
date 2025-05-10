import apiClient from './apiClient';
import axios from 'axios';

const interestFormService = {
  // Returns true if the user has not yet submitted the interest form
  checkFirstLogin: async () => {
    try {
      const response = await apiClient.get('/interest-form/check-first-login');
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        return true;
      }
      throw err;
    }
  },

  // Create a new interest form entry
  createInterestForm: async (data) => {
    const response = await apiClient.post('/interest-form', data);
    return response.data;
  },

  // Fetch the existing interest form data
  getInterestForm: async () => {
    const response = await apiClient.get('/interest-form');
    return response.data;
  },
};

export default interestFormService; 