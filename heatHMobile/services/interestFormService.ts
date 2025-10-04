import { httpClient } from './httpClient';
import { authService } from './authService';

export interface InterestFormData {
  name: string;
  surname: string;
  dateOfBirth: string;
  height: number;
  weight: number;
  gender: string;
  profilePhoto?: string | null;
}

const interestFormService = {
  // Returns true if the user has not yet submitted the interest form
  checkFirstLogin: async (): Promise<boolean> => {
    try {
      const token = await authService.getAccessToken();
      const response = await httpClient.get('/interest-form/check-first-login', undefined, token);
      return Boolean(response.data);
    } catch (err: any) {
      // If endpoint not found or form doesn't exist/forbidden, treat as first login
      if (err.message?.includes('404') || err.message?.includes('403')) {
        return false;
      }
      throw err;
    }
  },

  // Create a new interest form entry
  createInterestForm: async (data: InterestFormData) => {
    console.log('InterestFormService: Creating interest form with data:', data);
    const token = await authService.getAccessToken();
    console.log('InterestFormService: Retrieved token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    console.log('InterestFormService: Making request to /interest-form/submit');
    console.log('InterestFormService: Token preview:', token.substring(0, 20) + '...');
    
    try {
      const response = await httpClient.post('/interest-form/submit', data, token);
      console.log('InterestFormService: Response received:', response);
      return response.data;
    } catch (error) {
      console.log('InterestFormService: Submit failed, trying update instead:', error);
      // If submit fails, try update instead
      const updateResponse = await httpClient.put('/interest-form/update-form', data, token);
      console.log('InterestFormService: Update response received:', updateResponse);
      return updateResponse.data;
    }
  },

  // Fetch the existing interest form data
  getInterestForm: async () => {
    const token = await authService.getAccessToken();
    const response = await httpClient.get('/interest-form/get-form', undefined, token);
    return response.data;
  },

  // Update existing interest form data
  updateInterestForm: async (data: InterestFormData) => {
    const token = await authService.getAccessToken();
    const response = await httpClient.put('/interest-form/update-form', data, token);
    return response.data;
  },

  // Test authentication by making a simple request
  testAuthentication: async () => {
    console.log('InterestFormService: Testing authentication');
    const token = await authService.getAccessToken();
    console.log('InterestFormService: Retrieved token for test:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.log('InterestFormService: No token available, throwing error');
      throw new Error('No authentication token available');
    }
    
    console.log('InterestFormService: Token preview:', token.substring(0, 20) + '...');
    
    try {
      console.log('InterestFormService: Making test request to /interest-form/check-first-login');
      const response = await httpClient.get('/interest-form/check-first-login', undefined, token);
      console.log('InterestFormService: Authentication test successful:', response);
      return true;
    } catch (error) {
      console.log('InterestFormService: Authentication test failed:', error);
      throw error;
    }
  },
};

export default interestFormService;