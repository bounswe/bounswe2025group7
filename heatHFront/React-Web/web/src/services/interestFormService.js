import apiClient from './apiClient';

const interestFormService = {
  // Returns true if the user has not yet submitted the interest form
  checkFirstLogin: async () => {
    const response = await apiClient.get('/interest-form/check-first-login');
    return response.data;
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