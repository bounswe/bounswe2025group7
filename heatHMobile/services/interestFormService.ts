import axios from 'axios';
import { apiClient } from './apiClient';

interface InterestFormData {
  name: string;
  surname: string;
  dateOfBirth: string;
  height: number;
  weight: number;
  gender: string;
  profilePhoto?: string;
}

export const interestFormService = {
  // Returns true if the user has not yet submitted the interest form
  checkFirstLogin: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get('/interest-form/check-first-login');
      console.log('Check first login response:', response.data);
      return response.data;
    } catch (err) {
      // If endpoint not found or form doesn't exist/forbidden, treat as not first login
      if (axios.isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 403)) {
        return false;
      }
      throw err;
    }
  },

  // Create a new interest form entry
  createInterestForm: async (data: InterestFormData) => {
    const response = await apiClient.post('/interest-form/submit', data);
    return response.data;
  },

  // Fetch the existing interest form data
  getInterestForm: async () => {
    const response = await apiClient.get('/interest-form/get-form');
    return response.data;
  },

  // Update existing interest form data
  updateInterestForm: async (data: InterestFormData) => {
    const response = await apiClient.put('/interest-form/update-form', data);
    return response.data;
  },
};


