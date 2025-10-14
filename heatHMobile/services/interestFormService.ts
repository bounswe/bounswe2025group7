import { httpClient } from './httpClient';
import { authService } from './authService';
import { config } from '@/constants/config';

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
    console.log('InterestFormService: Getting interest form...');
    const token = await authService.getAccessToken();
    console.log('InterestFormService: Retrieved token:', token ? `Token exists (${token.substring(0, 20)}...)` : 'No token');
    
    // Debug: Decode JWT to see username
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('InterestFormService: JWT payload:', payload);
        console.log('InterestFormService: Username from JWT:', payload.sub);
        console.log('InterestFormService: Token issued at:', new Date(payload.iat * 1000));
        console.log('InterestFormService: Token expires at:', new Date(payload.exp * 1000));
      } catch (e) {
        console.log('InterestFormService: Could not decode JWT:', e);
      }
    }
    
    console.log('InterestFormService: Making request to /interest-form/get-form');
    console.log('InterestFormService: Full URL will be:', `${config.apiBaseUrl}/interest-form/get-form`);
    console.log('InterestFormService: Request details:');
    console.log('  - Method: GET');
    console.log('  - URL: /interest-form/get-form');
    console.log('  - Token: ', token ? `Bearer ${token.substring(0, 20)}...` : 'None');
    console.log('  - Headers: Authorization, Content-Type');
    
    const response = await httpClient.get('/interest-form/get-form', undefined, token);
    console.log('InterestFormService: Response received:', response);
    return response.data;
  },

  // Update existing interest form data
  updateInterestForm: async (data: InterestFormData) => {
    console.log('InterestFormService: Updating interest form with data:', data);
    const token = await authService.getAccessToken();
    console.log('InterestFormService: Retrieved token for update:', token ? `Token exists (${token.substring(0, 20)}...)` : 'No token');
    
    if (!token) {
      console.log('InterestFormService: No token available for update, throwing error');
      throw new Error('No authentication token available');
    }
    
    // Debug: Decode JWT to see username
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('InterestFormService: JWT payload for update:', payload);
      console.log('InterestFormService: Username from JWT for update:', payload.sub);
      console.log('InterestFormService: Token issued at:', new Date(payload.iat * 1000));
      console.log('InterestFormService: Token expires at:', new Date(payload.exp * 1000));
      
      // Check if token is expired
      const now = new Date();
      const expDate = new Date(payload.exp * 1000);
      const isExpired = now > expDate;
      console.log('InterestFormService: Token is expired:', isExpired);
      
      if (isExpired) {
        throw new Error('Token is expired');
      }
    } catch (e) {
      console.log('InterestFormService: Could not decode JWT for update:', e);
    }
    
    // Test authentication first with a simple request using the SAME token
    console.log('InterestFormService: Testing authentication before update...');
    try {
      const testResponse = await httpClient.get('/interest-form/check-first-login', undefined, token);
      console.log('InterestFormService: Authentication test successful:', testResponse);
    } catch (testError) {
      console.log('InterestFormService: Authentication test failed:', testError);
      throw new Error('Authentication failed: Token is invalid or expired');
    }
    
    // Get the token again right before the PUT request to ensure it's still the same
    const tokenBeforePut = await authService.getAccessToken();
    console.log('InterestFormService: Token before PUT:', tokenBeforePut ? `Token exists (${tokenBeforePut.substring(0, 20)}...)` : 'No token');
    
    if (tokenBeforePut !== token) {
      console.log('InterestFormService: WARNING - Token changed between test and PUT request!');
      console.log('InterestFormService: Original token:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('InterestFormService: New token:', tokenBeforePut ? tokenBeforePut.substring(0, 20) + '...' : 'No token');
    }
    
    console.log('InterestFormService: Making PUT request to /interest-form/update-form');
    const response = await httpClient.put('/interest-form/update-form', data, tokenBeforePut);
    console.log('InterestFormService: Update response received:', response);
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

  // Convert InterestFormData to ProfileData
  toProfileData: (data: any) => {
    return {
      firstName: data.name || '',
      lastName: data.surname || '',
      weight: data.weight || 0,
      height: data.height || 0,
      dateOfBirth: data.dateOfBirth || '',
      gender: data.gender || '',
      profilePhoto: data.profilePhoto || null,
    };
  },

  // Convert ProfileData to InterestFormData
  fromProfileData: (data: any) => {
    return {
      name: data.firstName || '',
      surname: data.lastName || '',
      weight: data.weight || 0,
      height: data.height || 0,
      dateOfBirth: data.dateOfBirth || '',
      gender: data.gender || '',
      profilePhoto: data.profilePhoto || null,
    };
  },
};

export default interestFormService;
